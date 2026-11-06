"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownToLine,
  ArrowDownLeft,
  Fingerprint,
  Send,
  Wallet,
  Zap,
  ChevronRight,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { PageHeader, DemoNotice, CopyButton } from '@/components/common'
import { ActivityChart, StatCard } from '@/components/dashboard'
import { StatusBadge, TxDetailsModal, TxIcon } from '@/components/transactions'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { usdRates } from '@/data/mock-wallet'
import { fmtDate, shorten } from '@/utils/format'
import type { Transaction, StealthPaymentStatus } from '@/types'

function StealthStatusBadge({ status }: { status: StealthPaymentStatus }) {
  const map: Record<StealthPaymentStatus, { tone: 'warn' | 'success' | 'danger' | 'neutral' | 'purple' | 'cyan'; label: string }> = {
    GENERATED: { tone: 'neutral', label: 'GENERATED' },
    PENDING: { tone: 'warn', label: 'PENDING' },
    RECEIVED: { tone: 'success', label: 'RECEIVED' },
    CLAIMED: { tone: 'cyan', label: 'CLAIMED' },
    USED: { tone: 'purple', label: 'USED' },
  }
  const config = map[status] || { tone: 'neutral', label: status }
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export default function DashboardPage() {
  const {
    settings,
    wallet,
    transactions,
    identity,
    stealthRecords,
    claimStealthPayment,
    simulateIncomingStealthPayment,
    toast,
  } = useAppStore()

  const [sel, setSel] = useState<Transaction | null>(null)
  const [timeRange, setTimeRange] = useState('This Week')

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Page Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Welcome back, {settings.name.split(' ')[0]}
            </h1>
            <p className="mt-0.5 text-xs text-[var(--foreground-secondary)] font-mono">
              EIP-5564 STEALTH PAYMENT TELEMETRY & VAULT
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto text-xs h-8 font-mono"
            onClick={() => {
              simulateIncomingStealthPayment()
              toast('Simulated incoming stealth payment detected via viewing key!')
            }}
          >
            <Zap className="size-3.5 text-[var(--primary)]" /> Simulate Incoming Event
          </Button>
        </div>

        <DemoNotice />

        {/* 4 TOP METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            label="Total Balance"
            value="2.48 ETH"
            sub="≈ $4,921.00 USD"
            icon={<Wallet className="size-3.5" />}
          />
          <StatCard
            label="Privacy Rating"
            value="98%"
            badge="SHIELDED"
            badgeTone="success"
            sub="Zero on-chain links"
            icon={<Shield className="size-3.5 text-[var(--accent)]" />}
          />
          <StatCard
            label="Transactions"
            value={`${transactions.length || 24}`}
            badge="+12%"
            badgeTone="cyan"
            sub="Past 30 active days"
            icon={<TrendingUp className="size-3.5 text-[var(--accent)]" />}
          />
          <StatCard
            label="Total Received"
            value="1.76 ETH"
            sub="≈ $3,492.00 USD"
            icon={<ArrowDownLeft className="size-3.5 text-[var(--primary)]" />}
          />
        </div>

        {/* MIDDLE ROW: PAYMENT ACTIVITY CHART & QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart Card */}
          <Card className="p-4 sm:p-5 lg:col-span-2 min-w-0">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="font-display text-sm font-bold text-[var(--foreground)]">Payment Volume Telemetry</h2>
                <p className="text-[11px] font-mono text-[var(--muted)]">Calculated in ETH over current reporting period</p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] px-2.5 py-1 text-xs font-mono text-[var(--foreground)] outline-none cursor-pointer hover:border-[var(--border-strong)] transition-colors"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
            <ActivityChart />
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-[var(--foreground)] mb-3 pb-2 border-b border-[var(--border)]">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Link
                  href="/send"
                  className="group flex items-center justify-between rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5 transition-all hover:border-[var(--primary)] hover:bg-[var(--surface-elevated)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-control bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30">
                      <Send className="size-3.5" />
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground)]">Send Payment</span>
                  </div>
                  <ChevronRight className="size-3.5 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
                </Link>

                <Link
                  href="/receive"
                  className="group flex items-center justify-between rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-control bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                      <ArrowDownToLine className="size-3.5" />
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground)]">Receive Payment</span>
                  </div>
                  <ChevronRight className="size-3.5 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
                </Link>

                <Link
                  href="/identity"
                  className="group flex items-center justify-between rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-control bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]">
                      <Fingerprint className="size-3.5" />
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground)]">My Stealth Identity</span>
                  </div>
                  <ChevronRight className="size-3.5 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Stealth Identity Preview Card at bottom of Quick Actions */}
            <div className="mt-4 rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase text-[var(--muted)]">IDENTITY STATUS</span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[var(--accent)]">
                  <span className="size-1.5 rounded-full bg-[var(--accent)]" /> ACTIVE
                </span>
              </div>
              <p className="mt-1.5 font-mono text-xs text-[var(--foreground)] truncate">
                {identity?.metaAddress || 'st:0x8f3a9d...e2b1'}
              </p>
            </div>
          </Card>
        </div>

        {/* ONE-TIME STEALTH ADDRESS VAULT (EIP-5564) */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-bold text-[var(--foreground)]">
                  One-Time Stealth Addresses (EIP-5564 Registry)
                </h2>
                <span className="rounded-control bg-[var(--surface-secondary)] px-2 py-0.5 text-[10px] font-mono font-semibold text-[var(--primary)] border border-[var(--border)]">
                  {stealthRecords.length} DERIVED
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--foreground-secondary)]">
                Every payment generates a single-use destination address. Claimed funds transition to USED status.
              </p>
            </div>
            <Link href="/identity" className="text-xs font-mono text-[var(--primary)] hover:underline self-start sm:self-auto">
              View full identity →
            </Link>
          </div>

          {/* Mobile Card List (< 640px) */}
          <div className="space-y-2 sm:hidden">
            {stealthRecords.slice(0, 5).map((rec) => (
              <div
                key={rec.id}
                className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[var(--foreground)]">
                    {rec.amount} {rec.token}
                  </span>
                  <StealthStatusBadge status={rec.status} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[var(--muted)] block uppercase">Destination Address</span>
                  <span className="font-mono text-xs text-[var(--accent)] break-all">
                    {rec.oneTimeAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                  <span>{rec.network}</span>
                  <span>{fmtDate(rec.createdAt)}</span>
                </div>
                {rec.status === 'RECEIVED' && (
                  <Button
                    size="sm"
                    className="w-full text-xs h-7 mt-1 font-mono"
                    onClick={() => {
                      claimStealthPayment(rec.id)
                      toast(`Claimed ${rec.amount} ${rec.token} to main wallet!`)
                    }}
                  >
                    Claim Funds
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (≥ 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">One-Time Address</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stealthRecords.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-[var(--foreground)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--accent)]">{shorten(rec.oneTimeAddress, 8, 6)}</span>
                        <CopyButton text={rec.oneTimeAddress} label="" className="h-5 px-1 text-[10px]" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--foreground)]">
                      {rec.amount} {rec.token}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-[var(--foreground-secondary)]">{rec.network}</td>
                    <td className="py-2.5 px-3">
                      <StealthStatusBadge status={rec.status} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-[var(--muted)]">{fmtDate(rec.createdAt)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {rec.status === 'RECEIVED' ? (
                        <Button
                          size="sm"
                          className="h-6 px-2.5 text-[11px] font-mono"
                          onClick={() => {
                            claimStealthPayment(rec.id)
                            toast(`Claimed ${rec.amount} ${rec.token} to main wallet!`)
                          }}
                        >
                          Claim
                        </Button>
                      ) : rec.status === 'USED' ? (
                        <span className="text-[11px] font-mono text-[var(--muted)]">CLAIMED & SPENT</span>
                      ) : (
                        <span className="text-xs font-mono text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RECENT TRANSACTIONS */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3.5 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="font-display text-sm font-bold text-[var(--foreground)]">Recent Activity</h2>
            <Link href="/transactions" className="text-xs font-mono text-[var(--primary)] hover:underline">
              View all records ({transactions.length}) →
            </Link>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {transactions.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => setSel(t)}
                className="flex items-center justify-between py-2.5 hover:bg-[var(--surface-secondary)] px-2 rounded-control cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TxIcon type={t.type} />
                  <div>
                    <p className="text-xs font-medium text-[var(--foreground)]">
                      {t.type === 'sent' ? 'Payment Transmitted' : 'Payment Received'}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] font-mono">
                      {shorten(t.counterparty, 6, 4)} · {fmtDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-[var(--foreground)]">
                    {t.type === 'sent' ? '-' : '+'}{t.amount} {t.asset}
                  </p>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <TxDetailsModal tx={sel} onClose={() => setSel(null)} />
    </AppShell>
  )
}
