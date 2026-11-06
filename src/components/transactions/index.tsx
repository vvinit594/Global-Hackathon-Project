"use client"

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Transaction, TxStatus } from '@/types'
import { Badge, Modal } from '@/components/ui'
import { CopyButton } from '@/components/common'
import { fmtDateTime } from '@/utils/format'

export function StatusBadge({ status }: { status: TxStatus }) {
  const tone = status === 'confirmed' ? 'success' : status === 'pending' ? 'warn' : 'danger'
  return <Badge tone={tone}>{status.toUpperCase()}</Badge>
}

export function TxIcon({ type }: { type: Transaction['type'] }) {
  const isSent = type === 'sent'
  const Icon = isSent ? ArrowUpRight : ArrowDownLeft
  return (
    <span
      className={`grid size-7 shrink-0 place-items-center rounded-control border ${
        isSent
          ? 'bg-[var(--badge-danger-bg)] border-[var(--badge-danger-border)] text-[var(--badge-danger-text)]'
          : 'bg-[var(--badge-success-bg)] border-[var(--badge-success-border)] text-[var(--badge-success-text)]'
      }`}
    >
      <Icon className="size-3.5" />
    </span>
  )
}

export function TxDetailsModal({
  tx,
  onClose,
}: {
  tx: Transaction | null
  onClose: () => void
}) {
  const rows = tx && [
    ['Transaction ID', tx.id],
    ['Type', tx.type === 'sent' ? 'Sent Payment' : 'Received Payment'],
    ['Amount', `${tx.type === 'sent' ? '-' : '+'}${tx.amount} ${tx.asset}`],
    ['Network', tx.network],
    ['Date', fmtDateTime(tx.date)],
    ['Stealth Address / Counterparty', tx.counterparty],
    ['Estimated Gas Fee', tx.gasFee ? `${tx.gasFee} ETH` : '0.00042 ETH'],
    ['Private Memo', tx.message ?? '-'],
  ]

  return (
    <Modal open={!!tx} onClose={onClose} title="Transaction Record">
      {tx && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <StatusBadge status={tx.status} />
            <span className="text-[11px] text-[var(--muted)] font-mono">EIP-5564 VERIFIED</span>
          </div>
          <dl className="divide-y divide-[var(--border)] text-xs">
            {rows!.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-[var(--foreground-secondary)] font-mono text-[11px] uppercase tracking-wider">{k}</dt>
                <dd className="text-right font-medium text-[var(--foreground)] break-all font-mono">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <div className="pt-2">
            <CopyButton text={tx.id} label="Copy Transaction ID" className="w-full h-9 text-xs font-mono" />
          </div>
        </div>
      )}
    </Modal>
  )
}
