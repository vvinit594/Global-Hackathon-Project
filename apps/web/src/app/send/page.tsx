"use client"

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2, XCircle, ShieldCheck, Sparkles, KeyRound } from 'lucide-react'
import { Button, Card, Field, Input, Modal, Select, Textarea } from '@/components/ui'
import { DemoNotice, PageHeader, CopyButton } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { assets, gasByNetwork, networks, usdRates } from '@/data/mock-wallet'
import { paymentService } from '@/services'
import { useAppStore } from '@/store/app-store'
import { fmtUsd, shorten } from '@/utils/format'
import { deriveOneTimeStealthAddress, isValidStealthMetaAddress } from '@/utils/stealth'

const schema = z.object({
  to: z
    .string()
    .min(12, 'Enter a valid stealth meta-address')
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
  const [ephemeralKey, setEphemeralKey] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: {
      to: '',
      network: 'Ethereum',
      asset: 'ETH',
      amount: undefined,
      message: '',
    },
  })

  const w = watch()
  const amt = Number(w.amount) || 0
  const gas = gasByNetwork[w.network] ?? 0
  const bal = wallet.balances[w.asset] ?? 0

  // Real-time derivation of unique one-time stealth address from receiver's meta-address
  const stealthDerivation = useMemo(() => {
    if (w.to && isValidStealthMetaAddress(w.to)) {
      try {
        return deriveOneTimeStealthAddress(w.to)
      } catch (e) {
        return null
      }
    }
    return null
  }, [w.to])

  const submit = (v: Out) => {
    if (v.amount > bal) {
      toast(`Insufficient ${v.asset} balance (demo)`, 'error')
      return
    }
    const derived = deriveOneTimeStealthAddress(v.to)
    setDerivedOneTimeAddress(derived.oneTimeAddress)
    setEphemeralKey(derived.ephemeralPublicKey)
    setData(v)
    setPhase('confirm')
  }

  const confirm = async () => {
    if (!data) return
    setPhase('processing')

    // Simulate service call
    const r = await paymentService.submitPayment({
      to: data.to,
      amount: data.amount,
      asset: data.asset,
      network: data.network,
    })

    if (data.message?.toLowerCase().includes('fail')) {
      setPhase('failed')
      return
    }

    setTxId(r.id)

    // Create full one-time stealth address record and transaction
    createOneTimeStealthPayment({
      receiverMetaAddress: data.to,
      amount: data.amount,
      asset: data.asset,
      network: data.network,
      memo: data.message || undefined,
    })

    setPhase('success')
  }

  const again = () => {
    reset()
    setPhase('form')
    setData(null)
  }

  if (phase === 'processing' || phase === 'success' || phase === 'failed') {
    return (
      <AppShell>
        <div>
          <PageHeader title="Transaction status" />
          <Card className="mx-auto max-w-lg p-10 text-center">
            {phase === 'processing' && (
              <>
                <Loader2 className="mx-auto size-12 animate-spin text-sage-deep" />
                <h2 className="mt-5 text-xl font-semibold text-ink">
                  Deriving stealth destination & submitting
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Generating ephemeral keypair and one-time stealth destination address.
                </p>
              </>
            )}
            {phase === 'success' && (
              <>
                <CheckCircle2 className="mx-auto size-12 text-sage-deep" />
                <h2 className="mt-5 text-xl font-semibold text-ink">
                  Payment submitted (One-Time Address)
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {data?.amount} {data?.asset} on {data?.network}
                </p>
                <div className="mt-4 rounded-2xl bg-canvas p-4 text-left">
                  <p className="text-xs text-ink-soft">Generated One-Time Address (Unlinkable):</p>
                  <p className="mt-1 font-mono text-xs font-semibold break-all text-ink">
                    {derivedOneTimeAddress}
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">Transaction ID:</p>
                  <p className="mt-0.5 font-mono text-xs break-all text-ink">{txId}</p>
                </div>
                <div className="mt-6 flex justify-center gap-3">
                  <Link to="/transactions">
                    <Button>View history</Button>
                  </Link>
                  <Button variant="ghost" onClick={again}>
                    Send another
                  </Button>
                </div>
              </>
            )}
            {phase === 'failed' && (
              <>
                <XCircle className="mx-auto size-12 text-danger" />
                <h2 className="mt-5 text-xl font-semibold text-ink">Payment failed (demo)</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Simulated error because the message contained "fail".
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button onClick={() => setPhase('form')}>Try again</Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div>
        <PageHeader
          title="Send payment"
          description="Pay a receiver's permanent stealth meta-address. A fresh one-time stealth destination address will be derived automatically."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
              <Field
                label="Receiver's permanent stealth meta-address"
                error={errors.to?.message}
                hint="Permanent & reusable. Example: st:eth:0x028c9fe47b..."
              >
                <Input
                  placeholder="st:eth:0x02…"
                  className="font-mono text-xs"
                  {...register('to')}
                />
              </Field>

              {/* Real-time One-time derivation badge */}
              {stealthDerivation && (
                <div className="rounded-2xl border border-sage bg-sage-soft p-3.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink">
                    <ShieldCheck className="size-4 text-sage-deep" />
                    <span>One-Time Stealth Address Derived</span>
                  </div>
                  <p className="mt-1.5 font-mono text-xs break-all text-ink">
                    {stealthDerivation.oneTimeAddress}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-soft">
                    Unique to this payment. Will never be reused.
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Network">
                  <Select {...register('network')}>
                    {networks.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cryptocurrency">
                  <Select {...register('asset')}>
                    {assets.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                label="Amount"
                error={errors.amount?.message}
                hint={`Available: ${bal} ${w.asset}`}
              >
                <Input type="number" step="any" placeholder="0.00" {...register('amount')} />
              </Field>

              <Field
                label="Message (optional)"
                error={errors.message?.message}
                hint="Included in the encrypted note payload"
              >
                <Textarea rows={3} placeholder="Add a note or reference" {...register('message')} />
              </Field>

              <Button type="submit" size="lg" className="w-full">
                Review payment
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-3 font-semibold text-ink">Payment preview</h2>
              <dl className="space-y-2.5 text-sm">
                {[
                  ['Amount', `${amt || 0} ${w.asset}`],
                  ['Value', fmtUsd(amt * (usdRates[w.asset] ?? 0))],
                  ['Network', w.network],
                  ['Est. gas fee', `~${gas} ETH`],
                  [
                    'One-Time Destination',
                    stealthDerivation
                      ? shorten(stealthDerivation.oneTimeAddress, 8, 6)
                      : 'Derived at review',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-5 bg-beige-soft border-line">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                <KeyRound className="size-4 text-amber-800" />
                <span>EIP-5564 Stealth Invariant</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                The permanent Stealth Meta-Address is <strong>never</strong> used as the destination address on-chain. Each payment generates a separate, single-use address.
              </p>
            </Card>

            <DemoNotice />
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal open={phase === 'confirm'} onClose={() => setPhase('form')} title="Confirm payment">
          {data && (
            <div className="space-y-4">
              <dl className="divide-y divide-line text-sm">
                {[
                  ['Receiver Meta-Address', shorten(data.to, 12, 6)],
                  ['One-Time Stealth Address', derivedOneTimeAddress],
                  ['Amount', `${data.amount} ${data.asset}`],
                  ['Network', data.network],
                  ['Est. gas', `~${gas} ETH`],
                  ['Message', data.message || '-'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="text-right font-medium break-all font-mono text-xs text-ink">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-ink-soft">
                Confirming derives the one-time stealth destination address and simulates submission on the testnet.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setPhase('form')}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirm}>
                  Confirm & Send
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  )
}
