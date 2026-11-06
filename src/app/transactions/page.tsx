"use client"

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Input } from '@/components/ui'
import { EmptyState, PageHeader, DemoNotice } from '@/components/common'
import { StatusBadge, TxDetailsModal, TxIcon } from '@/components/transactions'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn, fmtDate, shorten } from '@/utils/format'
import type { Transaction } from '@/types'

const filters = ['All', 'Sent', 'Received', 'Pending', 'Failed'] as const

export default function TransactionsPage() {
  const transactions = useAppStore((s) => s.transactions)
  const [f, setF] = useState<(typeof filters)[number]>('All')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Transaction | null>(null)

  const rows = useMemo(
    () =>
      transactions.filter((t) => {
        const lowerF = f.toLowerCase()
        const m = lowerF === 'all' || t.type === lowerF || t.status === lowerF
        const s =
          !q ||
          [t.id, t.network, t.asset, t.counterparty, t.message ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase())
        return m && s
      }),
    [transactions, f, q]
  )

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Transactions"
          description="EIP-5564 stealth payment history and cryptographic transfer ledger"
        />

        <DemoNotice />

        {/* Filter Buttons and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filters.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className={cn(
                  'shrink-0 cursor-pointer rounded-control px-3 py-1 font-mono text-[11px] font-medium transition-colors duration-150',
                  f === x
                    ? 'bg-[var(--primary)] text-white font-semibold shadow-sm'
                    : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                )}
              >
                {x.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative sm:w-60">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--muted)]" />
            <Input
              placeholder="Search by hash or address..."
              className="pl-8 h-8 text-xs font-mono"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No transactions matched" body="Refine your filter query or search keyword." />
        ) : (
          <Card className="overflow-hidden border-[var(--border)]">
            {/* Desktop Table (≥ 640px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-secondary)] font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Direction</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Counterparty / Stealth Tag</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSel(t)}
                      className="cursor-pointer hover:bg-[var(--surface-secondary)] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <TxIcon type={t.type} />
                          <span className="font-medium text-xs text-[var(--foreground)]">
                            {t.type === 'sent' ? 'Sent' : 'Received'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-xs text-[var(--foreground)]">
                        <span className={t.type === 'sent' ? 'text-[var(--foreground)]' : 'text-[var(--accent)]'}>
                          {t.type === 'sent' ? '-' : '+'}{t.amount} {t.asset}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-[var(--foreground-secondary)]">
                        {shorten(t.counterparty, 8, 6)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-[var(--muted)]">
                        {fmtDate(t.date)}, 10:24 AM
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< 640px) */}
            <div className="divide-y divide-[var(--border)] md:hidden">
              {rows.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSel(t)}
                  className="p-3.5 space-y-2 hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TxIcon type={t.type} />
                      <span className="font-medium text-xs text-[var(--foreground)]">
                        {t.type === 'sent' ? 'Payment Transmitted' : 'Payment Received'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-[var(--foreground)]">
                      {t.type === 'sent' ? '-' : '+'}{t.amount} {t.asset}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 font-mono">
                    <span className="text-[11px] text-[var(--muted)] truncate max-w-[170px]">
                      {shorten(t.counterparty, 6, 4)}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <TxDetailsModal tx={sel} onClose={() => setSel(null)} />
    </AppShell>
  )
}
