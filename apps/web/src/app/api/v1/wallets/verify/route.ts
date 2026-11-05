import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMessage, isAddress } from 'viem';
import { requireAuth } from '@/lib/auth';

const verifyWalletSchema = z.object({
  address: z.string().refine((val) => isAddress(val), {
    message: 'Invalid Ethereum address format.',
  }),
  message: z.string().min(1, 'Message is required.'),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Invalid signature format.'),
});

/**
 * POST /api/v1/wallets/verify
 * Cryptographically verifies ownership of an Ethereum address via EIP-191 signature.
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

  const parsed = verifyWalletSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Validation failed.',
        },
      },
      { status: 400 }
    );
  }

  const { address, message, signature } = parsed.data;

  try {
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: { code: 'SIGNATURE_INVALID', message: 'Cryptographic signature verification failed.' } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      data: {
        verified: true,
        address,
        userId: auth.userId,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'VERIFICATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to verify signature.',
        },
      },
      { status: 500 }
    );
  }
}

