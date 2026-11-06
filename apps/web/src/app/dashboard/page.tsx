"use client"

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownToLine,
  ArrowDownLeft,
  ArrowUpRight,
  Fingerprint,
  Send,
  Wallet,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { PageHeader, DemoNotice, CopyButton } from '@/components/common'
import { ActivityChart, QuickAction, StatCard, EcosystemHub } from '@/components/dashboard'
import { StatusBadge, TxDetailsModal, TxIcon } from '@/components/transactions'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { usdRates } from '@/data/mock-wallet'
import { fmtDate, fmtUsd, shorten } from '@/utils/format'
import type { Transaction, OneTimeStealthAddressRecord, StealthPaymentStatus } from '@/types'

function StealthStatusBadge({ status }: { status: StealthPaymentStatus }) {
  const map: Record<StealthPaymentStatus, { tone: 'warn' | 'success' | 'danger' | 'neutral'; label: string }> = {
    GENERATED: { tone: 'neutral', label: 'Generated' },
    PENDING: { tone: 'warn', label: 'Pending Mempool' },
    RECEIVED: { tone: 'success', label: 'Received (Ready)' },
    CLAIMED: { tone: 'neutral', label: 'Claimed' },
    USED: { tone: 'danger', label: 'Used / Spent' },
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
  const balance = Object.entries(wallet.balances).reduce((a, [k, v]) => a + v * (usdRates[k] ?? 0), 0)
  const usd = (t: Transaction) => t.amount * (usdRates[t.asset] ?? 0)
  const sent = transactions.filter((t) => t.type === 'sent').reduce((a, t) => a + usd(t), 0)
  const recv = transactions.filter((t) => t.type === 'received').reduce((a, t) => a + usd(t), 0)

  const unspentRecords = stealthRecords.filter(
    (r) => r.status === 'RECEIVED' || r.status === 'PENDING'
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={`Welcome back, ${settings.name.split(' ')[0]}`}
          description="Here is an overview of your demo account."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                simulateIncomingStealthPayment()
                toast('Simulated incoming stealth payment detected via viewing key!')
              }}
            >
              <Zap className="size-4 text-amber-700" /> Simulate Incoming Event
            </Button>
          }
        />
        <DemoNotice />

        {/* Top 3 Stat Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-sage p-6 lg:row-span-1 border-sage">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">Shielded balance</span>
              <Wallet className="size-4 text-ink" />
            </div>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">
              {wallet.connected ? fmtUsd(balance) : '—'}
            </p>
            <p className="mt-2 text-xs text-ink/80">
              {wallet.connected
                ? `${wallet.provider} · ${wallet.network}`
                : 'Connect a wallet to see balance'}
            </p>
            <Link
              to="/wallet"
              className="mt-4 inline-block rounded-full bg-white/60 px-4 py-1.5 text-xs font-medium text-ink hover:bg-white transition"
            >
              Manage wallet
            </Link>
          </Card>
          <StatCard
            label="Payments sent"
            value={fmtUsd(sent)}
            sub={`${transactions.filter((t) => t.type === 'sent').length} transactions`}
            icon={<ArrowUpRight className="size-4 text-ink" />}
          />
          <StatCard
            label="Payments received"
            value={fmtUsd(recv)}
            sub={`${transactions.filter((t) => t.type === 'received').length} transactions`}
            icon={<ArrowDownLeft className="size-4 text-ink" />}
          />
        </div>

        {/* Main Grid: Chart & Identity */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-ink">Payment activity</h2>
              <div className="flex gap-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <i className="size-2.5 rounded-full bg-sage-deep" />
                  Received
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2.5 rounded-full bg-[#c4ad88]" />
                  Sent
                </span>
              </div>
            </div>
            <ActivityChart />
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">Stealth identity</h2>
                <Badge tone={identity ? 'success' : 'warn'}>
                  {identity ? 'Active' : 'Not created'}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                {identity
                  ? 'Your permanent meta-address is ready to share. Each sender derives a unique one-time address.'
                  : 'Generate your identity to start receiving privately.'}
              </p>
              <Link
                to="/identity"
                className="mt-4 inline-block text-sm font-medium underline text-ink"
              >
                {identity ? 'View identity & keys' : 'Generate identity'}
              </Link>
            </Card>

            <div className="space-y-3">
              <QuickAction
                to="/send"
                icon={<Send className="size-5 text-ink" />}
                label="Send"
                desc="Derive one-time stealth address"
              />
              <QuickAction
                to="/receive"
                icon={<ArrowDownToLine className="size-5 text-ink" />}
                label="Receive"
                desc="Create a payment request"
              />
              <QuickAction
                to="/identity"
                icon={<Fingerprint className="size-5 text-ink" />}
                label="Identity"
                desc="Keys and QR code"
              />
            </div>
          </div>
        </div>

        {/* One-Time Stealth Address Vault Card */}
        <Card className="p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-ink">One-Time Stealth Addresses (EIP-5564 Vault)</h2>
                <span className="rounded-full bg-beige-soft px-2.5 py-0.5 text-xs font-medium text-ink">
                  {stealthRecords.length} Derived Addresses
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                Each payment lands on a distinct, unlinkable destination address. Claimed funds mark the address as USED to prevent address reuse.
              </p>
            </div>
            <Link to="/identity" className="text-sm underline text-ink">
              Identity details
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs font-medium text-ink-soft">
                <tr>
                  <th className="py-2.5 px-3">One-Time Address</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Ephemeral Pubkey</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stealthRecords.slice(0, 5).map((rec) => {
                  const canClaim = rec.status === 'RECEIVED'
                  return (
                    <tr key={rec.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-ink">
                            {shorten(rec.oneTimeAddress, 8, 6)}
                          </span>
                          <CopyButton text={rec.oneTimeAddress} label="" className="h-7 px-2" />
                        </div>
                        <span className="text-[11px] text-ink-soft">
                          Derived {fmtDate(rec.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-ink">
                          {rec.amount} {rec.asset}
                        </span>
                        <p className="text-[11px] text-ink-soft">
                          {fmtUsd(rec.amount * (usdRates[rec.asset] ?? 0))}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-ink-soft">{rec.network}</td>
                      <td className="py-3 px-3">
                        <StealthStatusBadge status={rec.status} />
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs text-ink-soft">
                          {shorten(rec.ephemeralPublicKey, 6, 4)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {canClaim ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              claimStealthPayment(rec.id)
                              toast(`Claimed ${rec.amount} ${rec.asset}! Address marked as USED.`)
                            }}
                          >
                            <ShieldCheck className="size-3.5" /> Claim Funds
                          </Button>
                        ) : rec.status === 'USED' ? (
                          <span className="text-xs font-medium text-ink-soft">Spent / Archived</span>
                        ) : rec.status === 'PENDING' ? (
                          <span className="text-xs text-amber-700">Detecting blocks...</span>
                        ) : (
                          <span className="text-xs text-ink-soft">{rec.status}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Protocol & Partner Integrations Hub */}
        <EcosystemHub />

        {/* Recent Transactions List */}
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent transactions</h2>
            <Link to="/transactions" className="text-sm underline text-ink">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {transactions.slice(0, 5).map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setSel(t)}
                  className="flex w-full cursor-pointer items-center gap-4 py-3 text-left hover:bg-canvas/60 transition-colors"
                >
                  <TxIcon type={t.type} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium capitalize text-ink">
                      {t.type} · {t.network}
                    </span>
                    <span className="text-xs text-ink-soft">{fmtDate(t.date)}</span>
                  </span>
                  <span className="hidden sm:block">
                    <StatusBadge status={t.status} />
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {t.type === 'sent' ? '-' : '+'}
                    {t.amount} {t.asset}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <TxDetailsModal tx={sel} onClose={() => setSel(null)} />
      </div>
    </AppShell>
  )
}
