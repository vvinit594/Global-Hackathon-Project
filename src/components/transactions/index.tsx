"use client"

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Transaction, TxStatus } from '@/types'
import { Badge, Modal } from '@/components/ui'
import { CopyButton } from '@/components/common'
import { fmtDateTime } from '@/utils/format'

export function StatusBadge({ status }: { status: TxStatus }) {
  const tone = status === 'confirmed' ? 'success' : status === 'pending' ? 'warn' : 'danger'
  return <Badge tone={tone}>{status[0].toUpperCase() + status.slice(1)}</Badge>
}

export function TxIcon({ type }: { type: Transaction['type'] }) {
  const Icon = type === 'sent' ? ArrowUpRight : ArrowDownLeft
  return (
    <span
      className={`grid size-10 shrink-0 place-items-center rounded-full ${
        type === 'sent' ? 'bg-beige' : 'bg-sage'
      }`}
    >
      <Icon className="size-4" />
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
    ['Type', tx.type],
    ['Amount', `${tx.type === 'sent' ? '-' : '+'}${tx.amount} ${tx.asset}`],
    ['Network', tx.network],
    ['Date', fmtDateTime(tx.date)],
    ['Counterparty', tx.counterparty],
    ['Gas fee', tx.gasFee ? `${tx.gasFee} ETH (est.)` : 'None'],
    ['Message', tx.message ?? '-'],
  ]

  return (
    <Modal open={!!tx} onClose={onClose} title="Transaction details">
      {tx && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <StatusBadge status={tx.status} />
            <span className="text-xs text-ink-soft">Demo record</span>
          </div>
          <dl className="divide-y divide-line text-sm">
            {rows!.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="text-right font-medium break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <CopyButton text={tx.id} label="Copy transaction ID" className="w-full" />
        </div>
      )}
    </Modal>
  )
}
