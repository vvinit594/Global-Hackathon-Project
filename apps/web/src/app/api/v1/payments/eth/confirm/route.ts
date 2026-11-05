import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@stealth/db';
import { getEthereumPublicClient } from '@/lib/ethereum';

const confirmSchema = z.object({
  paymentId: z.string().uuid(),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'Invalid Ethereum transaction hash format.'),
});

/**
 * POST /api/v1/payments/eth/confirm
 * Links on-chain transaction hash to prepared payment, updates status, and notifies receiver.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON request body.' } },
      { status: 400 }
    );
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message ?? 'Invalid transaction confirmation payload.',
        },
      },
      { status: 400 }
    );
  }

  const { paymentId, txHash } = parsed.data;

  try {
    const admin = getSupabaseAdmin();

    // 1. Fetch payment record
    const { data: payment, error: fetchErr } = await admin
      .from('payments')
      .select('id, sender_user_id, receiver_identity_id, amount, token_symbol, status')
      .eq('id', paymentId)
      .maybeSingle();

    if (fetchErr || !payment) {
      return NextResponse.json(
        { error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' } },
        { status: 404 }
      );
    }

    let initialStatus = 'submitted';
    let blockNumber: number | null = null;
    let blockTimestamp: string | null = null;

    // 2. Check on-chain receipt if available
    try {
      const publicClient = getEthereumPublicClient();
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (receipt) {
        if (receipt.status === 'success') {
          initialStatus = 'confirmed';
          blockNumber = Number(receipt.blockNumber);
          blockTimestamp = new Date().toISOString();
        } else if (receipt.status === 'reverted') {
          initialStatus = 'failed';
        }
      }
    } catch {
      // Transaction is pending in mempool or RPC is sync-lagged; remains 'submitted'
    }

    // 3. Update payment status in DB
    const { data: updatedPayment, error: updateErr } = await admin
      .from('payments')
      .update({
        tx_hash: txHash,
        status: initialStatus as any,
        block_number: blockNumber,
        block_timestamp: blockTimestamp,
        confirmed_at: initialStatus === 'confirmed' ? new Date().toISOString() : null,
      })
      .eq('id', paymentId)
      .select('id, stealth_address, ephemeral_public_key, amount, token_symbol, tx_hash, status, confirmed_at')
      .single();

    if (updateErr) throw updateErr;

    // 4. Notify receiver if linked to a registered user
    const { data: receiverIdentity } = await admin
      .from('stealth_identities')
      .select('user_id')
      .eq('id', payment.receiver_identity_id)
      .maybeSingle();

    if (receiverIdentity?.user_id) {
      await admin.from('notifications').insert({
        user_id: receiverIdentity.user_id,
        type: initialStatus === 'confirmed' ? 'payment_confirmed' : 'payment_detected',
        title: initialStatus === 'confirmed' ? 'Payment Confirmed' : 'Payment Submitted',
        message: `Stealth payment of ${payment.amount} ${payment.token_symbol} submitted on-chain.`,
        is_read: false,
        metadata: { paymentId, txHash, amount: payment.amount, status: initialStatus },
      });
    }

    return NextResponse.json({
      data: updatedPayment,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'PAYMENT_CONFIRM_FAILED',
          message: error instanceof Error ? error.message : 'Failed to confirm transaction.',
        },
      },
      { status: 500 }
    );
  }
}

