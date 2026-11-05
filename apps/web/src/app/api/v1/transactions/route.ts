import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

const transactionsQuerySchema = z.object({
  direction: z.enum(['sent', 'received', 'all']).default('all'),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * GET /api/v1/transactions
 * Returns unified transaction and payment records for the authenticated user,
 * covering both sent payments and received stealth payments.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const parsed = transactionsQuerySchema.safeParse({
    direction: searchParams.get('direction') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid query parameters.',
        },
      },
      { status: 400 }
    );
  }

  const { direction, status, limit, offset } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    // Fetch user's registered stealth identities to identify received payments
    const { data: userIdentities } = await admin
      .from('stealth_identities')
      .select('id')
      .eq('user_id', auth.userId);

    const identityIds = (userIdentities ?? []).map((i) => i.id);

    // Build query for payments
    let query = admin
      .from('payments')
      .select('id, sender_user_id, receiver_identity_id, stealth_address, ephemeral_public_key, chain_id, token_symbol, amount, tx_hash, block_number, status, created_at, confirmed_at, claimed_at', { count: 'exact' });

    if (direction === 'sent') {
      query = query.eq('sender_user_id', auth.userId);
    } else if (direction === 'received') {
      if (identityIds.length === 0) {
        return NextResponse.json({
          data: [],
          meta: { total: 0, limit, offset, timestamp: new Date().toISOString() },
        });
      }
      query = query.in('receiver_identity_id', identityIds);
    } else {
      // 'all'
      if (identityIds.length > 0) {
        query = query.or(`sender_user_id.eq.${auth.userId},receiver_identity_id.in.(${identityIds.join(',')})`);
      } else {
        query = query.eq('sender_user_id', auth.userId);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('status', status as any);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: payments, count, error } = await query;

    if (error) throw error;

    const formatted = (payments ?? []).map((p) => {
      const isSender = p.sender_user_id === auth.userId;
      return {
        id: p.id,
        direction: isSender ? 'sent' : 'received',
        txHash: p.tx_hash,
        stealthAddress: p.stealth_address,
        ephemeralPublicKey: p.ephemeral_public_key,
        amount: p.amount,
        tokenSymbol: p.token_symbol,
        chainId: p.chain_id,
        status: p.status,
        blockNumber: p.block_number,
        createdAt: p.created_at,
        confirmedAt: p.confirmed_at,
        claimedAt: p.claimed_at,
      };
    });

    return NextResponse.json({
      data: formatted,
      meta: {
        total: count ?? formatted.length,
        limit,
        offset,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'TRANSACTIONS_FETCH_FAILED', message: 'Failed to retrieve transactions.' } },
      { status: 500 }
    );
  }
}

