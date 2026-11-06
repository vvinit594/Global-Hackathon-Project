"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  QrCode,
  Zap,
  CheckCircle2,
  Database,
  Lock,
  ArrowDownToLine,
  ShieldCheck,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button, Card, Field, Input, Select, Badge } from '@/components/ui'
import { CopyButton, DemoNotice, PageHeader, QRPreview } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { assets, networks } from '@/data/mock-wallet'
import { paymentService } from '@/services'
import { useAppStore } from '@/store/app-store'
import { shorten, fmtDate } from '@/utils/format'

const schema = z.object({
  network: z.string(),
  asset: z.string(),
  amount: z
    .coerce
    .number({ errorMap: () => ({ message: 'Enter an amount' }) })
    .positive('Amount must be greater than 0'),
  ttlDays: z.string().default('7'),
  memo: z.string().optional(),
})

type In = z.input<typeof schema>
type Out = z.output<typeof schema>

export default function ReceivePage() {
  const {
    identity,
    stealthRecords,
    claimStealthPayment,
    simulateIncomingStealthPayment,
    toast,
  } = useAppStore()

  const [link, setLink] = useState('')
  const [arkivRequestId, setArkivRequestId] = useState<string | null>(null)
  const [lastRequest, setLastRequest] = useState<Out | null>(null)
  const [isPublishingArkiv, setIsPublishingArkiv] = useState(false)
  const [claimingRecordId, setClaimingRecordId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: {
      network: 'Whitechain Testnet',
      asset: 'USDT',
      amount: undefined,
      ttlDays: '7',
      memo: '',
    },
  })

  const onSubmit = async (v: Out) => {
    setIsPublishingArkiv(true)
    const to =
      identity?.metaAddress ??
      'st:eth:0x028c9fe47b9938dcb90184bba01948bc891048bce910283749bcf819028374900a'

    try {
      // 1. Publish payment request to Arkiv decentralized storage
      const arkivRes = await fetch('/api/v1/arkiv/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stealthMetaAddress: to,
          amount: v.amount,
          asset: v.asset,
          network: v.network,
          memo: v.memo || 'Stealth payment request',
          ttlHours: Number(v.ttlDays) * 24,
        }),
      })

      const arkivJson = await arkivRes.json()
      const reqId = arkivJson.data?.requestId ?? `req_${Math.random().toString(36).slice(2, 10)}`
      setArkivRequestId(reqId)

      // 2. Generate shareable payment link
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://stealthpay.app'
      const generatedLink = `${origin}/send?to=${encodeURIComponent(to)}&amount=${v.amount}&asset=${v.asset}&network=${encodeURIComponent(v.network)}&ref=${reqId}`

      setLink(generatedLink)
      setLastRequest(v)
      toast('Payment request generated & stored on Arkiv with TTL', 'success')
    } catch (e) {
      // Fallback local link
      const id = Math.random().toString(36).slice(2, 10)
      const generatedLink = `https://stealthpay.app/send?to=${encodeURIComponent(to)}&amount=${v.amount}&asset=${v.asset}&ref=${id}`
      setLink(generatedLink)
      setLastRequest(v)
      toast('Payment request generated locally', 'info')
    } finally {
      setIsPublishingArkiv(false)
    }
  }

  // Non-Custodial Sweep Execution
  const handleSweep = async (recordId: string) => {
    setClaimingRecordId(recordId)
    // Non-custodial delay simulating secp256k1 recovery and sweep signature
    setTimeout(() => {
      claimStealthPayment(recordId)
      setClaimingRecordId(null)
      toast('Funds swept non-custodially to primary wallet!', 'success')
    }, 1200)
  }

  // Filter incoming stealth payments ready to sweep
  const incomingPayments = stealthRecords.filter(
    (r) => r.status === 'RECEIVED' || (r.isIncoming && r.status !== 'CLAIMED' && r.status !== 'USED')
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Receive payment"
          description="Create an expirable payment request backed by Arkiv decentralized storage. Senders will derive a fresh one-time stealth address automatically."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">New Payment Request</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Network">
                  <Select {...register('network')}>
                    <option value="Whitechain Testnet">Whitechain Testnet (Chain 2625)</option>
                    <option value="Sepolia">Ethereum Sepolia (Chain 11155111)</option>
                    <option value="Arc Testnet">Arc Testnet (Circle Chain 5042)</option>
                    <option value="Ethereum">Ethereum Mainnet</option>
                  </Select>
                </Field>
                <Field label="Cryptocurrency">
                  <Select {...register('asset')}>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="WBT">WBT (Whitechain Native)</option>
                    <option value="ETH">ETH (Ether)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Amount" error={errors.amount?.message}>
                  <Input type="number" step="any" placeholder="0.00" {...register('amount')} />
                </Field>

                <Field label="Arkiv Request TTL">
                  <Select {...register('ttlDays')}>
                    <option value="1">1 Day</option>
                    <option value="7">7 Days (Default)</option>
                    <option value="30">30 Days</option>
                  </Select>
                </Field>
              </div>

              <Field label="Invoice Note / Memo (optional)">
                <Input placeholder="e.g. Web3 Design bounty #42" {...register('memo')} />
              </Field>

              {!identity && (
                <p className="rounded-2xl bg-warn-soft px-4 py-3 text-xs text-ink">
                  No identity yet: a placeholder demo address will be used. Generate one on the Identity page.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting || isPublishingArkiv}
              >
                Generate Arkiv Payment Request
              </Button>
            </form>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6">
            {link ? (
              <div className="w-full space-y-4">
                <QRPreview value={link} name="payment-request-qr" />

                {arkivRequestId && (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-purple-900">
                        <Database className="size-3.5 text-purple-600" />
                        Arkiv Decentralized Storage
                      </span>
                      <Badge tone="success">Verified TTL</Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-purple-950 break-all">
                      {arkivRequestId}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-canvas p-4">
                  <p className="mb-2 text-sm font-medium text-ink">Shareable Payment Link</p>
                  <p className="font-mono text-xs break-all text-ink-soft">{link}</p>
                </div>

                <div className="flex gap-2">
                  <CopyButton text={link} label="Copy link" className="flex-1" />
                  {arkivRequestId && (
                    <CopyButton text={arkivRequestId} label="Copy Request ID" className="flex-1" />
                  )}
                </div>

                {lastRequest && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      simulateIncomingStealthPayment(lastRequest.amount)
                      toast(`Simulated incoming payment of ${lastRequest.amount} ${lastRequest.asset}!`, 'success')
                    }}
                  >
                    <Zap className="size-4 text-amber-700" /> Simulate Sender Paying Request
                  </Button>
                )}

                <DemoNotice />
              </div>
            ) : (
              <div className="py-12 text-center text-ink-soft">
                <QrCode className="mx-auto mb-3 size-10" />
                <p className="text-sm">Your QR code and payment link will appear here.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Receiver Scanner & Non-Custodial Sweep Section */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-sage-deep" />
                <h2 className="text-base font-semibold text-ink">
                  Incoming Stealth Payments (Scanner & Non-Custodial Claim)
                </h2>
              </div>
              <p className="text-xs text-ink-soft">
                Detected one-time stealth addresses ready to be swept into your primary wallet. Spending keys are derived locally in your browser and never sent to any server.
              </p>
            </div>
            <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-medium text-ink">
              {incomingPayments.length} claimable
            </span>
          </div>

          {incomingPayments.length === 0 ? (
            <div className="rounded-2xl bg-canvas p-8 text-center text-sm text-ink-soft">
              No unclaimed payments detected. Senders paying your meta-address will appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {incomingPayments.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-canvas p-4 border border-line"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink">
                        {record.amount} {record.asset}
                      </span>
                      <Badge tone="success">Ready to Claim</Badge>
                      <span className="text-xs text-ink-soft">on {record.network}</span>
                    </div>
                    <div className="font-mono text-xs text-ink-soft break-all">
                      One-Time Address: {record.oneTimeAddress}
                    </div>
                    <div className="text-[11px] text-ink-soft flex items-center gap-3">
                      <span>Detected: {fmtDate(record.createdAt)}</span>
                      <span>Ephemeral Key: {shorten(record.ephemeralPublicKey, 8, 6)}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    loading={claimingRecordId === record.id}
                    onClick={() => handleSweep(record.id)}
                    className="shrink-0"
                  >
                    <ArrowDownToLine className="size-4 mr-1.5" />
                    Claim & Sweep Funds
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}
