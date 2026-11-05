import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateStealthAddress } from '@scopelift/stealth-address-sdk';
import { getSupabaseAdmin } from '@stealth/db';
import { requireAuth } from '@/lib/auth';

const prepareEthPaymentSchema = z.object({
  stealthMetaAddressURI: z
    .string()
    .regex(/^st:[a-zA-Z0-9]+:0x[0-9a-fA-F]{132}$/, 'Invalid ERC-5564 stealth meta-address URI'),
  amountWei: z
    .string()
    .regex(/^[1-9][0-9]*$/, 'amountWei must be a positive integer in wei string format'),
  tokenSymbol: z.string().default('ETH'),
  tokenAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/).optional().nullable(),
  chainId: z.number().int().default(11155111),
  note: z.string().max(250).optional(),
});

/**
 * POST /api/v1/payments/eth/prepare
 * Prepares an Ethereum ERC-5564 stealth payment:
 * 1. Derives one-time destination address (stealthAddress) and ephemeral public key (R)
 * 2. Records payment draft in `payments` table
 * 3. Returns paymentId and derived address for connected wallet execution
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let senderUserId: string | null = null;

  // Optional authentication: senders may be authenticated or guest/external
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const auth = await requireAuth(request);
    if (auth.ok) {
      senderUserId = auth.userId;
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON request body.' } },
      { status: 400 }
    );
  }

  const parsed = prepareEthPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid payment preparation parameters.',
        },
      },
      { status: 400 }
    );
  }

  const { stealthMetaAddressURI, amountWei, tokenSymbol, tokenAddress, chainId, note } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    // 1. Look up or verify receiver identity
    let { data: identity } = await admin
      .from('stealth_identities')
      .select('id, user_id, meta_address')
      .eq('meta_address', stealthMetaAddressURI)
      .maybeSingle();

    if (!identity) {
      // Auto-register identity if new
      // Extract Ps and Pv from URI
      const hexPart = stealthMetaAddressURI.split(':')[2]?.slice(2) ?? '';
      const pubViewKey = `0x${hexPart.slice(0, 66)}`;
      const pubSpendKey = `0x${hexPart.slice(66, 132)}`;

      const { data: newIdent, error: identErr } = await admin
        .from('stealth_identities')
        .insert({
          user_id: senderUserId ?? '00000000-0000-0000-0000-000000000000', // fallback or placeholder
          meta_address: stealthMetaAddressURI,
          scheme_id: 1,
          chain_id: chainId,
          network_name: 'sepolia',
          public_spend_key: pubSpendKey,
          public_view_key: pubViewKey,
          status: 'active',
        })
        .select('id, user_id, meta_address')
        .maybeSingle();

      if (!identErr && newIdent) {
        identity = newIdent;
      }
    }

    // 2. Cryptographically derive one-time stealth address
    const { stealthAddress, ephemeralPublicKey, viewTag } = generateStealthAddress({
      stealthMetaAddressURI,
    });

    // 3. Record draft payment
    const idempotencyKey = `prep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data: paymentRecord, error: paymentError } = await admin
      .from('payments')
      .insert({
        sender_user_id: senderUserId,
        receiver_identity_id: identity?.id ?? '00000000-0000-0000-0000-000000000000',
        stealth_address: stealthAddress.toLowerCase(),
        ephemeral_public_key: ephemeralPublicKey,
        chain_id: chainId,
        token_address: tokenAddress ?? null,
        token_symbol: tokenSymbol,
        token_decimals: 18,
        amount: amountWei,
        status: 'prepared',
        idempotency_key: idempotencyKey,
        note: note ?? null,
      })
      .select('id, stealth_address, ephemeral_public_key, amount, token_symbol, chain_id, status, created_at')
      .single();

    if (paymentError) {
      throw paymentError;
    }

    return NextResponse.json(
      {
        data: {
          paymentId: paymentRecord.id,
          stealthAddress,
          ephemeralPublicKey,
          viewTag,
          amountWei,
          tokenSymbol,
          chainId,
          status: 'prepared',
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'PAYMENT_PREPARE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to prepare stealth payment.',
        },
      },
      { status: 500 }
    );
  }
}

