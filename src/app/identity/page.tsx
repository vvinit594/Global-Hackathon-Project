"use client"

import { useState } from 'react'
import {
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  Shield,
} from 'lucide-react'
import { Badge, Button, Card, Modal } from '@/components/ui'
import { CopyButton, DemoNotice, PageHeader, QRPreview } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { identityService } from '@/services'
import { generateDemoIdentity } from '@/utils/mock-identity'
import { fmtDate, shorten } from '@/utils/format'
import type { StealthPaymentStatus } from '@/types'

function KeyRow({
  label,
  value,
  sublabel,
  isSensitive = false,
}: {
  label: string
  value: string
  sublabel?: string
  isSensitive?: boolean
}) {
  const [revealed, setRevealed] = useState(!isSensitive)
  const displayVal = revealed ? value : '•'.repeat(Math.min(value.length, 36))

  return (
    <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3 transition-all hover:border-[var(--border-strong)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[var(--foreground)]">{label}</span>
          {sublabel && (
            <span className="text-[11px] text-[var(--muted)] font-mono">({sublabel})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isSensitive && (
            <button
              type="button"
              onClick={() => setRevealed(!revealed)}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--foreground-secondary)] hover:text-[var(--foreground)] px-2 py-0.5 rounded-control hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              {revealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              <span>{revealed ? 'MASK' : 'REVEAL'}</span>
            </button>
          )}
          <CopyButton text={value} className="h-6 px-2 text-[10px]" />
        </div>
      </div>
      <p className="font-mono text-xs text-[var(--foreground)] break-all select-all">{displayVal}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: StealthPaymentStatus }) {
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

export default function IdentityPage() {
  const { identity, setIdentity, stealthRecords, toast } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [keysUnlocked, setKeysUnlocked] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const generate = async () => {
    setLoading(true)
    await identityService.generate()
    setIdentity(generateDemoIdentity())
    setKeysUnlocked(false)
    setLoading(false)
    toast('Demo stealth identity regenerated')
  }

  const handleUnlockPrivateKeys = () => {
    setKeysUnlocked(true)
    setConfirmModalOpen(false)
    toast('Private key section unlocked for this active session.')
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="My Stealth Identity"
          description="EIP-5564 permanent meta-address and cryptographic key pairs"
          action={
            <Button
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={generate}
              className="text-xs h-8 font-mono"
            >
              <RefreshCw className="size-3.5 text-[var(--primary)]" /> Regenerate Identity
            </Button>
          }
        />

        <DemoNotice />

        {/* TOP ROW: STEALTH META-ADDRESS & QR CODE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Credentials Card (2 Cols) */}
          <Card className="p-4 sm:p-5 lg:col-span-2 space-y-5">
            {/* Meta-Address Display */}
            <div className="rounded-card border border-[var(--border)] bg-[var(--surface-secondary)] p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-control bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]">
                    <Shield className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[var(--foreground)]">Stealth Meta-Address</h3>
                    <p className="text-[11px] font-mono text-[var(--muted)]">Permanent & reusable for all incoming private payments</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-control bg-[var(--badge-success-bg)] px-2 py-0.5 text-[10px] font-mono font-semibold text-[var(--badge-success-text)] border border-[var(--badge-success-border)]">
                  <span className="size-1.5 rounded-full bg-[var(--accent)]" /> ACTIVE
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-control border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
                <span className="font-mono text-xs sm:text-sm text-[var(--foreground)] break-all select-all font-medium">
                  {identity?.metaAddress || 'st:0x8f3a9d......e2b1'}
                </span>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <CopyButton text={identity?.metaAddress ?? ''} label="Copy" className="h-7 text-xs" />
                </div>
              </div>
            </div>

            {/* Public Keys Section */}
            <div>
              <h3 className="font-mono text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2.5">
                Public Keys (Safe for Broadcast)
              </h3>
              <div className="space-y-2">
                <KeyRow
                  label="Viewing Key"
                  sublabel="K_view"
                  value={identity?.viewingKey || '0x04ab2c9f71d882049e7710384bc910283749'}
                />
                <KeyRow
                  label="Spending Key"
                  sublabel="K_spend"
                  value={identity?.spendingKey || '0x6d8e4f3c9210283749bcf819028374900aef'}
                />
              </div>
            </div>

            {/* Sensitive Private Keys Section */}
            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h3 className="font-mono text-[11px] font-semibold text-[var(--warning)] uppercase tracking-wider">
                    Security & Private Keys (Sensitive)
                  </h3>
                  <p className="text-[11px] font-mono text-[var(--muted)]">In-memory only · Never transmitted over the wire</p>
                </div>
                {!keysUnlocked && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 font-mono border-[var(--warning)]/40 text-[var(--warning)] hover:bg-[var(--warning)]/10"
                    onClick={() => setConfirmModalOpen(true)}
                  >
                    <Lock className="size-3" /> Unlock Sensitive Keys
                  </Button>
                )}
              </div>

              {keysUnlocked ? (
                <div className="space-y-2">
                  <KeyRow
                    label="Private Spending Key"
                    sublabel="k_spend"
                    value={identity?.spendingPrivateKey || '0x7a3c9df10283749bcf819028374900aef10283749bcf819028374900aef1234'}
                    isSensitive={true}
                  />
                  <KeyRow
                    label="Private Viewing Key"
                    sublabel="k_view"
                    value={identity?.viewingPrivateKey || '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'}
                    isSensitive={true}
                  />
                </div>
              ) : (
                <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3 text-center">
                  <Lock className="size-4 mx-auto text-[var(--muted)] mb-1" />
                  <p className="text-xs text-[var(--foreground-secondary)] font-mono">
                    Private spending and viewing keys are locked for security isolation.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* QR Code Container Card (1 Col) */}
          <Card className="p-5 flex flex-col items-center justify-center text-center">
            <h3 className="font-display text-sm font-bold text-[var(--foreground)] mb-1">
              Share Meta-Address
            </h3>
            <p className="text-xs text-[var(--foreground-secondary)] mb-4">
              Senders generate one-time stealth addresses via this payload.
            </p>

            <QRPreview
              value={identity?.metaAddress ?? 'st:0x8f3a9d......e2b1'}
              name="stealth-meta-address.png"
              size={180}
            />
          </Card>
        </div>

        {/* BOTTOM SECTION: ADDRESS HISTORY */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3.5 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="font-display text-sm font-bold text-[var(--foreground)]">Address Derivation History</h2>
              <p className="text-xs text-[var(--foreground-secondary)]">Previously derived one-time stealth addresses linked to this identity</p>
            </div>
            <span className="text-[11px] font-mono text-[var(--muted)]">IMMUTABLE REGISTRY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">One-Time Address</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {stealthRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-[var(--accent)]">
                      {shorten(r.oneTimeAddress, 8, 6)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-[var(--muted)]">
                      {fmtDate(r.createdAt)}, 10:24 AM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Confirmation Modal to Unlock Sensitive Keys */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Reveal Private Key Material?"
      >
        <div className="space-y-3.5">
          <div className="flex items-start gap-2.5 rounded-control border border-[var(--color-state-error)]/40 bg-[var(--badge-danger-bg)] p-3 text-xs text-[var(--badge-danger-text)]">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              Anyone with access to your private spending key can spend your funds or decrypt your transfer metadata.
            </span>
          </div>
          <p className="text-xs text-[var(--foreground-secondary)]">
            In Stealth Pay, private keys remain exclusively in client browser memory and are never transmitted over the network.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleUnlockPrivateKeys}
            >
              Confirm & Reveal
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
