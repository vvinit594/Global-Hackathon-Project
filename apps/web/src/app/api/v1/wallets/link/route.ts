import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMessage, isAddress } from 'viem';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const linkWalletSchema = z.object({
  address: z.string().refine((val) => isAddress(val), {
    message: 'Invalid Ethereum address.',
  }),
  label: z.string().trim().min(1).max(50).default('Ethereum Wallet'),
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
  chainId: z.number().int().positive().default(11155111),
});

/**
 * POST /api/v1/wallets/link
 * Verifies signature and records/associates an Ethereum wallet with the authenticated user.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
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

  const parsed = linkWalletSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid wallet link request.',
        },
      },
      { status: 400 }
    );
  }

  const { address, label, message, signature, chainId } = parsed.data;

  // Verify signature ownership
  const isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!isValid) {
    return NextResponse.json(
      { error: { code: 'SIGNATURE_INVALID', message: 'Signature does not match wallet address.' } },
      { status: 401 }
    );
  }

  try {
    const admin = getSupabaseAdmin();

    // Check if wallet already linked for this user
    const { data: existing } = await admin
      .from('wallets')
      .select('id, wallet_id, receive_address, label')
      .eq('user_id', auth.userId)
      .eq('receive_address', address.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        data: {
          wallet: existing,
          alreadyLinked: true,
        },
        meta: { timestamp: new Date().toISOString() },
      });
    }

    const walletId = `eth_${address.slice(2, 10)}_${Date.now()}`;

    const { data: newWallet, error: insertError } = await admin
      .from('wallets')
      .insert({
        user_id: auth.userId,
        label,
        wallet_label: label,
        bitgo_wallet_id: walletId,
        wallet_id: walletId,
        coin: `eth_${chainId}`,
        network: `ethereum_${chainId}`,
        receive_address: address.toLowerCase(),
      })
      .select('id, label, wallet_id, coin, network, receive_address, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json(
      {
        data: {
          wallet: newWallet,
          linked: true,
        },
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'WALLET_LINK_FAILED', message: 'Failed to record wallet linkage.' } },
      { status: 500 }
    );
  }
}

