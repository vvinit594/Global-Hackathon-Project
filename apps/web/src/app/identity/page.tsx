"use client"

import { useState } from 'react'
import { Fingerprint, RefreshCw, ShieldCheck, KeyRound, Eye, Lock } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { CopyButton, DemoNotice, PageHeader, QRPreview } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { identityService } from '@/services'
import { generateDemoIdentity } from '@/utils/mock-identity'
import { fmtDate, shorten } from '@/utils/format'
import type { StealthPaymentStatus } from '@/types'

function KeyRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-canvas p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {icon}
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <p className="font-mono text-xs break-all text-ink-soft">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: StealthPaymentStatus }) {
  const map: Record<StealthPaymentStatus, { tone: 'warn' | 'success' | 'danger' | 'neutral'; label: string }> = {
    GENERATED: { tone: 'neutral', label: 'Generated' },
    PENDING: { tone: 'warn', label: 'Pending' },
    RECEIVED: { tone: 'success', label: 'Received' },
    CLAIMED: { tone: 'neutral', label: 'Claimed' },
    USED: { tone: 'danger', label: 'Used / Blacklisted' },
  }
  const config = map[status] || { tone: 'neutral', label: status }
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export default function IdentityPage() {
  const { identity, setIdentity, stealthRecords, toast } = useAppStore()
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    await identityService.generate()
    setIdentity(generateDemoIdentity())
    setLoading(false)
    toast('Demo stealth identity generated')
  }

  if (!identity) {
    return (
      <AppShell>
        <div>
          <PageHeader
            title="My Stealth Identity"
            description="Your reusable address for receiving private payments."
          />
          <Card className="mx-auto max-w-xl p-10 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-sage text-ink">
              <Fingerprint className="size-8" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-ink">Generate your stealth identity</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Creates a permanent meta-address with a public spending key and a public viewing key (EIP-5564 standard).
            </p>
            <Button size="lg" className="mt-6" loading={loading} onClick={generate}>
              {loading ? 'Generating…' : 'Generate identity'}
            </Button>
            <DemoNotice className="mt-6 text-left" />
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="My Stealth Identity"
          description="Share your permanent meta-address to receive private payments. Every payment automatically generates a fresh one-time destination address."
          action={
            <Button variant="ghost" size="sm" loading={loading} onClick={generate}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-ink">Identity status</h2>
                  <p className="text-xs text-ink-soft">Permanent Reusable Meta-Address</p>
                </div>
                <Badge tone="success">Active</Badge>
              </div>
              <p className="text-sm text-ink-soft">Created {fmtDate(identity.createdAt)}</p>
            </Card>

            <Card className="space-y-3 p-6">
              <KeyRow
                label="Permanent Stealth Meta-Address"
                value={identity.metaAddress}
                icon={<Fingerprint className="size-4 text-sage-deep" />}
              />
              <KeyRow
                label="Public Spending Key (K_spend)"
                value={identity.spendingKey}
                icon={<Lock className="size-4 text-amber-700" />}
              />
              <KeyRow
                label="Public Viewing Key (K_view)"
                value={identity.viewingKey}
                icon={<Eye className="size-4 text-sage-deep" />}
              />
            </Card>
            <DemoNotice />
          </div>

          <Card className="h-fit p-6">
            <h2 className="mb-4 text-center font-semibold text-ink">Identity QR Code</h2>
            <QRPreview value={identity.metaAddress} name="stealth-identity-qr" />
            <p className="mt-3 text-center text-xs text-ink-soft">
              Scannable by senders to derive unique stealth addresses.
            </p>
          </Card>
        </div>

        {/* List of derived one-time stealth addresses */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink">One-Time Stealth Addresses Record</h2>
              <p className="text-xs text-ink-soft">
                All previously derived addresses remain recorded. Spent addresses are flagged as USED and never reused.
              </p>
            </div>
            <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-ink">
              {stealthRecords.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-canvas text-xs font-medium text-ink-soft">
                <tr>
                  <th className="py-2.5 px-3">One-Time Address</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Network</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3">Ephemeral Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stealthRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-canvas/50">
                    <td className="py-3 px-3 font-mono text-xs font-semibold text-ink">
                      {rec.oneTimeAddress}
                    </td>
                    <td className="py-3 px-3 font-medium text-ink">
                      {rec.amount} {rec.asset}
                    </td>
                    <td className="py-3 px-3 text-ink-soft">{rec.network}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="py-3 px-3 text-xs text-ink-soft">{fmtDate(rec.createdAt)}</td>
                    <td className="py-3 px-3 font-mono text-xs text-ink-soft">
                      {shorten(rec.ephemeralPublicKey, 8, 6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
