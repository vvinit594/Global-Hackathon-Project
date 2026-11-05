import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@stealth/db';

/**
 * GET /api/v1/wallets/list
 * Returns all verified wallets belonging to the authenticated user.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: wallets, error } = await admin
      .from('wallets')
      .select('id, label, wallet_id, coin, network, receive_address, created_at')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: wallets ?? [],
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'WALLETS_FETCH_FAILED', message: 'Failed to retrieve connected wallets.' } },
      { status: 500 }
    );
  }
}

