import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@stealth/db';
import { getEthereumPublicClient } from '@/lib/ethereum';

/**
 * GET /api/v1/payments/eth/status/[id]
 * Checks live payment status, synchronizing on-chain confirmation progress.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const paymentId = params.id;

  try {
    const admin = getSupabaseAdmin();

    const { data: payment, error } = await admin
      .from('payments')
      .select('id, sender_user_id, receiver_identity_id, stealth_address, ephemeral_public_key, chain_id, token_symbol, amount, tx_hash, block_number, status, created_at, confirmed_at, claimed_at')
      .eq('id', paymentId)
      .maybeSingle();

    if (error || !payment) {
      return NextResponse.json(
        { error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' } },
        { status: 404 }
      );
    }

    // If submitted but not yet confirmed, check on-chain receipt
    if (payment.status === 'submitted' && payment.tx_hash) {
      try {
        const publicClient = getEthereumPublicClient();
        const receipt = await publicClient.getTransactionReceipt({
          hash: payment.tx_hash as `0x${string}`,
        });

        if (receipt && receipt.status === 'success') {
          const { data: updated } = await admin
            .from('payments')
            .update({
              status: 'confirmed',
              block_number: Number(receipt.blockNumber),
              confirmed_at: new Date().toISOString(),
            })
            .eq('id', payment.id)
            .select()
            .single();

          if (updated) {
            return NextResponse.json({
              data: updated,
              meta: { timestamp: new Date().toISOString(), synchronized: true },
            });
          }
        }
      } catch {
        // Still pending on-chain
      }
    }

    return NextResponse.json({
      data: payment,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'STATUS_CHECK_FAILED', message: 'Failed to verify payment status.' } },
      { status: 500 }
    );
  }
}

