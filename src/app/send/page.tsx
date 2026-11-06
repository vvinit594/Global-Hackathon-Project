"use client"

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2, Sparkles, ArrowRight, Shield } from 'lucide-react'
import { Button, Card, Field, Input, Modal, Select } from '@/components/ui'
import { DemoNotice, PageHeader } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { gasByNetwork, usdRates } from '@/data/mock-wallet'
import { paymentService } from '@/services'
import { useAppStore } from '@/store/app-store'
import { fmtUsd, shorten } from '@/utils/format'
import { deriveOneTimeStealthAddress, isValidStealthMetaAddress } from '@/utils/stealth'

const schema = z.object({
  to: z
    .string()
    .min(10, 'Enter a valid stealth meta-address')
    .startsWith('st:', 'Meta-address should start with "st:"'),
  network: z.string(),
  asset: z.string(),
  amount: z
    .coerce
    .number({ errorMap: () => ({ message: 'Enter an amount' }) })
    .positive('Amount must be greater than 0'),
  message: z.string().max(140, 'Max 140 characters').optional(),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>
type Phase = 'form' | 'confirm' | 'processing' | 'success' | 'failed'

export default function SendPage() {
  const { wallet, createOneTimeStealthPayment, toast } = useAppStore()
  const [phase, setPhase] = useState<Phase>('form')
  const [data, setData] = useState<Out | null>(null)
  const [txId, setTxId] = useState('')
  const [derivedOneTimeAddress, setDerivedOneTimeAddress] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: '',
      network: 'Ethereum (Sepolia)',
      asset: 'ETH',
      amount: undefined,
      message: '',
    },
  })

  const w = watch()
  const amt = Number(w.amount) || 0
  const gas = gasByNetwork[w.network] ?? 0.00042
  const bal = wallet.balances[w.asset] ?? 2.48

  // Real-time derivation of unique one-time stealth address from receiver's meta-address
  const stealthDerivation = useMemo(() => {
    if (w.to && isValidStealthMetaAddress(w.to)) {
      try {
        return deriveOneTimeStealthAddress(w.to)
      } catch {
        return null
      }
    }
    return null
  }, [w.to])

  const submit = (v: Out) => {
    if (v.amount > bal) {
      toast(`Insufficient ${v.asset} balance in demo wallet`, 'error')
      return
    }
    const derived = deriveOneTimeStealthAddress(v.to)
    setDerivedOneTimeAddress(derived.oneTimeAddress)
    setData(v)
    setPhase('confirm')
  }

  const confirm = async () => {
    if (!data) return
    setPhase('processing')

    const r = await paymentService.submitPayment({
      to: data.to,
      amount: data.amount,
      asset: data.asset,
      network: data.network,
    })

    if (r.ok) {
      createOneTimeStealthPayment({
        receiverMetaAddress: data.to,
        amount: data.amount,
        asset: data.asset,
        network: data.network,
        memo: data.message,
      })

      setTxId(r.id)
      setPhase('success')
      toast('One-time stealth payment transmitted!')
    } else {
      setPhase('failed')
    }
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Send Payment"
          description="Transmit crypto to an unlinkable, single-use EIP-5564 stealth destination"
        />

        <DemoNotice />

        {/* 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5 items-start">
          {/* LEFT: SEND FORM CARD */}
          <Card className="p-5 sm:p-6">
            <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
              {/* Receiver Meta-Address */}
              <Field
                label="Recipient's Stealth Meta-Address"
                error={errors.to?.message}
                hint="Permanent public meta-address starting with st: or st:eth:"
              >
                <div className="relative">
                  <Input
                    placeholder="st:0x... or paste stealth address"
                    className="font-mono text-xs pr-20"
                    {...register('to')}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'to',
                        'st:eth:0x028c9fe47b9938dcb90184bba01948bc891048bce910283749bcf819028374900a'
                      )
                    }
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-control bg-[var(--surface-secondary)] hover:bg-[var(--border)] px-2 py-0.5 text-[10px] font-mono font-semibold text-[var(--primary)] border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    PASTE DEMO
                  </button>
                </div>
              </Field>

              {/* Amount and Asset Selector */}
              <Field label="Transfer Amount" error={errors.amount?.message}>
                <div className="grid grid-cols-[1fr_110px] gap-2">
                  <div className="relative">
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="font-mono text-xs"
                      {...register('amount')}
                    />
                    <button
                      type="button"
                      onClick={() => setValue('amount', bal > 0 ? bal : 1.0)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-mono font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>

                  <Select {...register('asset')} className="font-mono text-xs">
                    <option value="ETH">ETH</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="DAI">DAI</option>
                  </Select>
                </div>
                <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--muted)]">
                  <span>Balance: {bal} {w.asset}</span>
                  <span>≈ {fmtUsd(amt * (usdRates[w.asset] ?? 2000))} USD</span>
                </div>
              </Field>

              {/* Network Selector */}
              <Field label="Execution Network">
                <Select {...register('network')} className="font-mono text-xs">
                  <option value="Ethereum (Sepolia)">Ethereum (Sepolia)</option>
                  <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                  <option value="Optimism">Optimism</option>
                </Select>
              </Field>

              {/* Real-time One-time Derivation Preview Badge */}
              {stealthDerivation && (
                <div className="rounded-control border border-[var(--primary)]/30 bg-[var(--primary-soft)]/20 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--primary)]">
                    <Sparkles className="size-3" />
                    <span>REAL-TIME ONE-TIME ADDRESS DERIVED</span>
                  </div>
                  <p className="font-mono text-xs text-[var(--foreground)] break-all font-semibold">
                    {stealthDerivation.oneTimeAddress}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--muted)]">
                    Zero correlation to recipient&apos;s permanent meta-address on block explorers.
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button type="submit" className="w-full mt-2 h-10 font-mono text-xs">
                Review Stealth Payment <ArrowRight className="size-3.5" />
              </Button>
            </form>
          </Card>

          {/* RIGHT: HOW IT WORKS? PANEL */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
              Protocol Operation
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: '01',
                  title: "Resolve Recipient Meta-Address",
                  desc: 'Input recipient permanent meta-address (st:eth:...) containing public viewing and spending keys.',
                },
                {
                  step: '02',
                  title: 'Diffie-Hellman Derivation',
                  desc: 'A random ephemeral scalar r generates single-use target P and announcement R on secp256k1.',
                },
                {
                  step: '03',
                  title: 'Publish On-Chain',
                  desc: 'Funds are transferred to destination P while announcement R is broadcasted in transaction logs.',
                },
                {
                  step: '04',
                  title: 'Private Viewing Key Scan',
                  desc: 'The recipient detects and sweeps funds privately without disclosing historical balances.',
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-control bg-[var(--surface-secondary)] border border-[var(--border)] font-mono text-[10px] font-bold text-[var(--primary)]">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--foreground)]">{s.title}</h3>
                    <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3 text-[11px] font-mono text-[var(--muted)]">
              STANDARD: EIP-5564 NON-INTERACTIVE STEALTH ADDRESSES
            </div>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <Modal
        open={phase === 'confirm'}
        onClose={() => setPhase('form')}
        title="Confirm Stealth Payment"
      >
        {data && (
          <div className="space-y-4">
            <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Sending Amount:</span>
                <span className="font-mono font-bold text-[var(--foreground)] text-sm">
                  {data.amount} {data.asset}
                </span>
              </div>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Estimated Gas:</span>
                <span className="text-[var(--foreground)] font-mono">{gas} ETH</span>
              </div>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Network:</span>
                <span className="text-[var(--foreground)] font-mono">{data.network}</span>
              </div>
            </div>

            <div className="rounded-control border border-[var(--primary)]/30 bg-[var(--primary-soft)]/20 p-3 space-y-1">
              <span className="font-mono text-[10px] font-semibold text-[var(--primary)] uppercase tracking-wider block">
                Derived One-Time Stealth Destination
              </span>
              <p className="font-mono text-xs text-[var(--foreground)] break-all font-semibold">
                {derivedOneTimeAddress}
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => setPhase('form')}
              >
                Back
              </Button>
              <Button className="flex-1 text-xs font-mono" onClick={confirm}>
                Confirm & Transmit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* PROCESSING MODAL */}
      <Modal open={phase === 'processing'} onClose={() => {}} title="Broadcasting Payment">
        <div className="py-6 text-center space-y-3">
          <Loader2 className="size-8 animate-spin mx-auto text-[var(--primary)]" />
          <div>
            <h3 className="font-display text-sm font-semibold text-[var(--foreground)]">Broadcasting Ephemeral Announcement</h3>
            <p className="font-mono text-[11px] text-[var(--muted)] mt-1">
              Committing transaction to mempool...
            </p>
          </div>
        </div>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        open={phase === 'success'}
        onClose={() => {
          setPhase('form')
          reset()
        }}
        title="Payment Broadcasted"
      >
        <div className="space-y-4">
          <div className="py-3 text-center">
            <div className="grid size-10 place-items-center rounded-control bg-[var(--badge-success-bg)] border border-[var(--badge-success-border)] text-[var(--badge-success-text)] mx-auto mb-2.5">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold text-[var(--foreground)]">Stealth Payment Sent</h3>
            <p className="text-xs text-[var(--foreground-secondary)] mt-0.5">
              Funds deposited into one-time blinded destination address.
            </p>
          </div>

          <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-3 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Tx Hash:</span>
              <span className="text-[var(--foreground)]">{shorten(txId, 6, 4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Stealth Address:</span>
              <span className="text-[var(--accent)] font-semibold">{shorten(derivedOneTimeAddress, 6, 4)}</span>
            </div>
          </div>

          <Button
            className="w-full h-9 font-mono text-xs"
            onClick={() => {
              setPhase('form')
              reset()
            }}
          >
            Acknowledge & Close
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
