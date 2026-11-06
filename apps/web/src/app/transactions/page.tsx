"use client"

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Input } from '@/components/ui'
import { EmptyState, PageHeader } from '@/components/common'
import { StatusBadge, TxDetailsModal, TxIcon } from '@/components/transactions'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn, fmtDate } from '@/utils/format'
import type { Transaction } from '@/types'

const filters = ['all', 'sent', 'received', 'pending', 'failed'] as const

export default function TransactionsPage() {
  const transactions = useAppStore((s) => s.transactions)
  const [f, setF] = useState<(typeof filters)[number]>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Transaction | null>(null)

  const rows = useMemo(
    () =>
      transactions.filter((t) => {
        const m = f === 'all' || t.type === f || t.status === f
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
      <div>
        <PageHeader
          title="Transactions"
          description="Demo transaction history and one-time stealth payments (immutable records)."
        />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className={cn(
                  'cursor-pointer rounded-full border px-4 py-1.5 text-sm capitalize transition',
                  f === x
                    ? 'border-sage bg-sage text-ink font-medium'
                    : 'border-line bg-card text-ink-soft hover:bg-sage-soft hover:text-ink'
                )}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              placeholder="Search ID, network, asset…"
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No transactions found" body="Try a different filter or search term." />
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-line bg-canvas px-5 py-3 text-xs font-medium text-ink-soft md:grid">
              <span>Transaction & Stealth Ref</span>
              <span>Network</span>
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            <ul className="divide-y divide-line">
              {rows.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSel(t)}
                    className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 text-left hover:bg-canvas/70 md:grid-cols-[2.2fr_1fr_1fr_1fr_1fr]"
                  >
                    <span className="flex items-center gap-3 md:col-auto">
                      <TxIcon type={t.type} />
                      <span className="hidden min-w-0 md:block">
                        <span className="block truncate font-mono text-xs text-ink font-semibold">
                          {t.id}
                        </span>
                        <span className="text-xs text-ink-soft capitalize">
                          {t.type} · To: {t.counterparty}
                        </span>
                      </span>
                    </span>
                    <span className="min-w-0 md:hidden">
                      <span className="block truncate font-mono text-xs text-ink">{t.id}</span>
                      <span className="text-xs text-ink-soft">
                        {t.network} · {fmtDate(t.date)}
                      </span>
                    </span>
                    <span className="hidden text-sm text-ink md:block">{t.network}</span>
                    <span className="hidden text-sm text-ink-soft md:block">
                      {fmtDate(t.date)}
                    </span>
                    <span className="hidden md:block">
                      <StatusBadge status={t.status} />
                    </span>
                    <span className="text-right text-sm font-semibold text-ink">
                      {t.type === 'sent' ? '-' : '+'}
                      {t.amount} {t.asset}
                      <span className="mt-1 block md:hidden">
                        <StatusBadge status={t.status} />
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <TxDetailsModal tx={sel} onClose={() => setSel(null)} />
      </div>
    </AppShell>
  )
}
