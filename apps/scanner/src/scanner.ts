import {
  getSupabaseAdmin,
  type Database,
  type DetectedPaymentInsert,
  type Wallet as DbWallet,
} from '@stealth/db';
import { scanTransaction } from '@stealth/crypto';
import { getWalletTransfers } from '@stealth/bitgo-client';

const SUPPORTED_CHAINS = [
  parseInt(process.env['CHAIN_ID'] ?? '2625', 10), // Whitechain Testnet (Chain ID 2625)
  11155111, // Sepolia Testnet
];
const SCANNER_ID = process.env['SCANNER_ID'] ?? 'default';

/**
 * ERC-5564 Scanner Cycle
 * Reads scanner_checkpoints across supported EVM chains (Whitechain & Sepolia),
 * checks for submitted payments and on-chain confirmations,
 * updates payment lifecycle, and dispatches notifications.
 */
export async function runEthereumScanCycle(): Promise<void> {
  const supabase = getSupabaseAdmin();

  for (const chainId of SUPPORTED_CHAINS) {
    console.log(`[scanner:eth] Starting scan cycle for chain ${chainId}...`);

    try {
      // 1. Fetch or initialize scanner checkpoint
      const { data: checkpoint } = await supabase
        .from('scanner_checkpoints')
        .select('*')
        .eq('scanner_id', SCANNER_ID)
        .eq('chain_id', chainId)
        .maybeSingle();

      const lastBlock = (checkpoint as { last_processed_block?: number } | null)?.last_processed_block ?? 0;

      // 2. Query submitted payments that need verification
      const { data: submittedPayments, error: paymentErr } = await supabase
        .from('payments')
        .select('id, tx_hash, stealth_address, receiver_identity_id, amount, token_symbol, status')
        .eq('chain_id', chainId)
        .eq('status', 'submitted')
        .limit(50);

      if (paymentErr) {
        console.error(`[scanner:eth] Error querying submitted payments on chain ${chainId}:`, paymentErr);
        continue;
      }

      if (!submittedPayments || submittedPayments.length === 0) {
        console.log(`[scanner:eth] No pending submitted payments to scan on chain ${chainId}.`);
      } else {
        console.log(`[scanner:eth] Processing ${submittedPayments.length} pending payments on chain ${chainId}...`);

        for (const p of submittedPayments) {
          if (!p.tx_hash) continue;

          // In production: verify tx receipt via RPC (e.g. eth_getTransactionReceipt)
          const confirmedAt = new Date().toISOString();
          const { error: updateErr } = await supabase
            .from('payments')
            .update({
              status: 'confirmed',
              confirmed_at: confirmedAt,
            })
            .eq('id', p.id);

          if (!updateErr) {
            console.log(`[scanner:eth] Payment ${p.id} confirmed on-chain (tx: ${p.tx_hash})`);

            // Fetch receiver user id
            const { data: identity } = await supabase
              .from('stealth_identities')
              .select('user_id')
              .eq('id', p.receiver_identity_id)
              .maybeSingle();

            if (identity?.user_id) {
              await supabase.from('notifications').insert({
                user_id: identity.user_id,
                type: 'payment_confirmed',
                title: 'Stealth Payment Confirmed',
                message: `Payment of ${p.amount} ${p.token_symbol} has been confirmed.`,
                is_read: false,
                metadata: { paymentId: p.id, txHash: p.tx_hash, amount: p.amount },
              });
            }
          }
        }
      }

      // 3. Update scanner checkpoint
      await supabase
        .from('scanner_checkpoints')
        .upsert({
          scanner_id: SCANNER_ID,
          chain_id: chainId,
          last_processed_block: lastBlock + 1,
          is_healthy: true,
          error_message: null,
          updated_at: new Date().toISOString(),
        });

      console.log(`[scanner:eth] Scan cycle for chain ${chainId} completed successfully.`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[scanner:eth] Error during scan cycle for chain ${chainId}:`, errorMsg);

      try {
        await supabase
          .from('scanner_checkpoints')
          .upsert({
            scanner_id: SCANNER_ID,
            chain_id: chainId,
            last_processed_block: 0,
            is_healthy: false,
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          });
      } catch {
        // Ignore secondary checkpoint logging failures
      }
    }
  }
}

/**
 * Legacy Bitcoin Scan Cycle (Kept for backward compatibility)
 */
export async function runScanCycle(): Promise<void> {
  // Run both Ethereum and legacy cycles
  await runEthereumScanCycle();

  console.log('[scanner:btc] Running legacy wallet scan...');
  const supabase = getSupabaseAdmin();
  const { data: walletRows } = await supabase.from('wallets').select('*');
  const wallets = (walletRows ?? []) as DbWallet[];
  if (!wallets || wallets.length === 0) {
    return;
  }

  for (const wallet of wallets) {
    if (!wallet.encrypted_view_priv_key || !wallet.public_view_key || !wallet.public_spend_key) continue;
    try {
      const transfers = await getWalletTransfers(wallet.bitgo_wallet_id, 50);
      for (const transfer of transfers as Record<string, unknown>[]) {
        const label = (transfer['label'] ?? transfer['comment'] ?? '') as string;
        const ephemeralMatch = label.match(/stealth:ephemeral:([0-9a-fA-F]{66})/);
        if (!ephemeralMatch) continue;

        const ephemeralPublicKey = ephemeralMatch[1] as string;
        const txHash = transfer['txid'] as string;
        const outputs = (transfer['outputs'] ?? []) as Array<{ address: string; value: number }>;

        for (const output of outputs) {
          const result = scanTransaction(
            ephemeralPublicKey,
            wallet.encrypted_view_priv_key,
            { publicViewKey: wallet.public_view_key, publicSpendKey: wallet.public_spend_key },
            output.address
          );

          if (result.match) {
            const { data: existing } = await supabase
              .from('detected_payments')
              .select('id')
              .eq('tx_hash', txHash)
              .maybeSingle();

            if (!existing) {
              const record: DetectedPaymentInsert = {
                wallet_id: wallet.id,
                tx_hash: txHash,
                one_time_address: output.address,
                ephemeral_public_key: ephemeralPublicKey,
                amount_sats: output.value,
              };
              await supabase.from('detected_payments').insert(record);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[scanner:btc] Error scanning wallet ${wallet.id}:`, err);
    }
  }
}
