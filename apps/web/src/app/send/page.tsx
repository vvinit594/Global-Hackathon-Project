"use client"

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Search,
  ArrowRightLeft,
  ExternalLink,
  Globe,
  Database,
} from 'lucide-react'
import { Button, Card, Field, Input, Modal, Select, Textarea, Badge } from '@/components/ui'
import { DemoNotice, PageHeader, CopyButton } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { assets, gasByNetwork, networks, usdRates } from '@/data/mock-wallet'
import { paymentService } from '@/services'
import { useAppStore } from '@/store/app-store'
import { fmtUsd, shorten } from '@/utils/format'
import { deriveOneTimeStealthAddress, isValidStealthMetaAddress } from '@/utils/stealth'
import { useAccount, useBalance } from 'wagmi'

const schema = z.object({
  to: z
    .string()
    .min(3, 'Enter a valid stealth meta-address, ENS name (.eth), or Arkiv Request ID (req_...)'),
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
  const wagmiAccount = useAccount()
  const { data: realBalance } = useBalance({
    address: wagmiAccount.address,
  })

  const [phase, setPhase] = useState<Phase>('form')
  const [data, setData] = useState<Out | null>(null)
  const [txId, setTxId] = useState('')
  const [derivedOneTimeAddress, setDerivedOneTimeAddress] = useState('')
  const [ephemeralKey, setEphemeralKey] = useState('')

  // ENS & Arkiv Resolution States
  const [isResolving, setIsResolving] = useState(false)
  const [resolvedMetaAddress, setResolvedMetaAddress] = useState<string | null>(null)
  const [resolutionSource, setResolutionSource] = useState<'ens' | 'arkiv' | null>(null)
  const [ensAvatar, setEnsAvatar] = useState<string | null>(null)

  // Uniswap Swap Quote State
  const [swapQuote, setSwapQuote] = useState<{
    inAmount: string
    outAmount: string
    rate: string
    slippage: string
  } | null>(null)

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
      network: 'Whitechain Testnet',
      asset: 'USDT',
      amount: undefined,
      message: '',
    },
  })

  const w = watch()
  const amt = Number(w.amount) || 0
  const gas = gasByNetwork[w.network] ?? 0.001
  const bal = wallet.balances[w.asset] ?? 1000

  // Effective stealth meta-address (either typed or resolved from ENS/Arkiv)
  const activeMetaAddress = useMemo(() => {
    if (resolvedMetaAddress) return resolvedMetaAddress
    if (w.to && isValidStealthMetaAddress(w.to)) return w.to
    return null
  }, [w.to, resolvedMetaAddress])

  // Real-time derivation of unique one-time stealth address
  const stealthDerivation = useMemo(() => {
    if (activeMetaAddress) {
      try {
        return deriveOneTimeStealthAddress(activeMetaAddress)
      } catch (e) {
        return null
      }
    }
    return null
  }, [activeMetaAddress])

  // Auto-resolve ENS or Arkiv request ID
  useEffect(() => {
    const input = w.to?.trim()
    if (!input) {
      setResolvedMetaAddress(null)
      setResolutionSource(null)
      setEnsAvatar(null)
      return
    }

    // 1. Check if input is an ENS domain (.eth)
    if (input.endsWith('.eth')) {
      setIsResolving(true)
      fetch(`/api/v1/ens/resolve?name=${encodeURIComponent(input)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data.stealthMetaAddress) {
            setResolvedMetaAddress(json.data.stealthMetaAddress)
            setResolutionSource('ens')
            setEnsAvatar(json.data.avatar)
            toast(`Resolved ENS stealth meta-address for ${input}`, 'success')
          } else {
            setResolvedMetaAddress(null)
            setResolutionSource(null)
          }
        })
        .catch(() => {
          setResolvedMetaAddress(null)
        })
        .finally(() => setIsResolving(false))
      return
    }

    // 2. Check if input is an Arkiv Request ID (req_...)
    if (input.startsWith('req_')) {
      setIsResolving(true)
      fetch(`/api/v1/arkiv/requests?requestId=${encodeURIComponent(input)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const req = json.data
            setResolvedMetaAddress(req.stealthMetaAddress)
            setResolutionSource('arkiv')
            if (req.amount) setValue('amount', req.amount)
            if (req.asset) setValue('asset', req.asset)
            if (req.memo) setValue('message', req.memo)
            toast(`Loaded payment request from Arkiv decentralized storage`, 'success')
          } else {
            setResolvedMetaAddress(null)
            setResolutionSource(null)
          }
        })
        .catch(() => {
          setResolvedMetaAddress(null)
        })
        .finally(() => setIsResolving(false))
      return
    }

    setResolvedMetaAddress(null)
    setResolutionSource(null)
    setEnsAvatar(null)
  }, [w.to, setValue, toast])

  // Fetch Uniswap Swap Quote when paying with a non-USDT asset or on demand
  useEffect(() => {
    if (amt > 0 && w.asset !== 'USDT') {
      fetch(`/api/v1/swap/quote?tokenIn=${w.asset}&tokenOut=USDT&amountIn=${amt}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setSwapQuote({
              inAmount: `${amt} ${w.asset}`,
              outAmount: `${Number(json.data.amountOut).toFixed(2)} USDT`,
              rate: `1 ${w.asset} ≈ ${(Number(json.data.amountOut) / amt).toFixed(2)} USDT`,
              slippage: `${json.data.maxSlippagePercent}%`,
            })
          }
        })
        .catch(() => setSwapQuote(null))
    } else {
      setSwapQuote(null)
    }
  }, [amt, w.asset])

  const submit = (v: Out) => {
    const targetMetaAddress = activeMetaAddress || v.to
    if (!isValidStealthMetaAddress(targetMetaAddress)) {
      toast('Invalid stealth meta-address format. Expected st:eth:0x<Ps><Pv>', 'error')
      return
    }
    const derived = deriveOneTimeStealthAddress(targetMetaAddress)
    setDerivedOneTimeAddress(derived.oneTimeAddress)
    setEphemeralKey(derived.ephemeralPublicKey)
    setData({ ...v, to: targetMetaAddress })
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

    if (data.message?.toLowerCase().includes('fail')) {
      setPhase('failed')
      return
    }

    setTxId(r.id)

    // Save to local client store
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
    setResolvedMetaAddress(null)
    setResolutionSource(null)
    setEnsAvatar(null)
    setSwapQuote(null)
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
                  Deriving stealth destination & broadcasting
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Generating ephemeral keypair on secp256k1 and emitting EIP-5564 announcement on Whitechain.
                </p>
              </>
            )}
            {phase === 'success' && (
              <>
                <CheckCircle2 className="mx-auto size-12 text-sage-deep" />
                <h2 className="mt-5 text-xl font-semibold text-ink">
                  Payment Submitted (One-Time Address)
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  {data?.amount} {data?.asset} on {data?.network}
                </p>
                <div className="mt-4 rounded-2xl bg-canvas p-4 text-left">
                  <p className="text-xs text-ink-soft">Generated One-Time Address (Unlinkable):</p>
                  <p className="mt-1 font-mono text-xs font-semibold break-all text-ink">
                    {derivedOneTimeAddress}
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">Transaction Hash:</p>
                  <div className="flex items-center justify-between">
                    <p className="mt-0.5 font-mono text-xs break-all text-ink">{txId}</p>
                    <a
                      href={`https://testnet.whitechainsentry.com/tx/${txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sage-deep hover:underline"
                    >
                      Explorer <ExternalLink className="size-3" />
                    </a>
                  </div>
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
                <h2 className="mt-5 text-xl font-semibold text-ink">Payment failed</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Transaction execution reverted. Please check balance and try again.
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
          description="Pay a receiver's permanent stealth meta-address, ENS domain (.eth), or Arkiv payment request. A fresh one-time destination address is derived automatically."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="p-6">
            <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
              <Field
                label="Receiver's Stealth Destination"
                error={errors.to?.message}
                hint="Accepts st:eth:0x... meta-address, ENS name (e.g. alice.eth), or Arkiv Request ID (req_...)"
              >
                <div className="relative">
                  <Input
                    placeholder="st:eth:0x... or name.eth or req_arkiv_..."
                    className="font-mono text-xs pr-10"
                    {...register('to')}
                  />
                  {isResolving && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="size-4 animate-spin text-sage-deep" />
                    </div>
                  )}
                </div>
              </Field>

              {/* ENS Resolution Card */}
              {resolutionSource === 'ens' && resolvedMetaAddress && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <Globe className="size-4 text-blue-600" />
                      <span>ENS Domain Resolved: {w.to}</span>
                    </div>
                    <Badge tone="success">ENS Verified</Badge>
                  </div>
                  <p className="mt-1.5 font-mono text-xs break-all text-blue-950">
                    {resolvedMetaAddress}
                  </p>
                </div>
              )}

              {/* Arkiv Request Resolution Card */}
              {resolutionSource === 'arkiv' && resolvedMetaAddress && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                      <Database className="size-4 text-purple-600" />
                      <span>Arkiv Decentralized Payment Request Loaded</span>
                    </div>
                    <Badge tone="success">Arkiv Verified</Badge>
                  </div>
                  <p className="mt-1.5 font-mono text-xs break-all text-purple-950">
                    {resolvedMetaAddress}
                  </p>
                </div>
              )}

              {/* Real-time One-time derivation badge */}
              {stealthDerivation && (
                <div className="rounded-2xl border border-sage bg-sage-soft p-3.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink">
                    <ShieldCheck className="size-4 text-sage-deep" />
                    <span>One-Time Stealth Address Derived (EIP-5564)</span>
                  </div>
                  <p className="mt-1.5 font-mono text-xs break-all text-ink">
                    {stealthDerivation.oneTimeAddress}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-soft">
                    <span>Ephemeral Public Key: {shorten(stealthDerivation.ephemeralPublicKey, 8, 6)}</span>
                    <Badge tone="neutral">Unlinkable</Badge>
                  </div>
                </div>
              )}

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

              {/* Uniswap Swap Quote Card */}
              {swapQuote && (
                <div className="rounded-2xl border border-pink-200 bg-pink-50/50 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-pink-900">
                      <ArrowRightLeft className="size-3.5 text-pink-600" />
                      Uniswap v3 Pre-Payment Swap
                    </span>
                    <span className="text-[11px] text-pink-700">{swapQuote.rate}</span>
                  </div>
                  <p className="mt-1 text-xs text-pink-900">
                    Converting {swapQuote.inAmount} into ≈ {swapQuote.outAmount} to settle stealth transfer.
                  </p>
                  <p className="mt-0.5 text-[11px] text-pink-600">
                    Max slippage protected at {swapQuote.slippage}
                  </p>
                </div>
              )}

              <Field
                label="Amount"
                error={errors.amount?.message}
                hint={
                  wagmiAccount.isConnected && realBalance
                    ? `Wallet balance: ${(Number(realBalance.value) / 10 ** realBalance.decimals).toFixed(4)} ${realBalance.symbol}`
                    : `Simulated balance: ${bal} ${w.asset}`
                }
              >
                <Input type="number" step="any" placeholder="0.00" {...register('amount')} />
              </Field>

              <Field
                label="Message / Reference (optional)"
                error={errors.message?.message}
                hint="Encrypted for the receiver in the announcement"
              >
                <Textarea rows={2} placeholder="Add a note or invoice reference" {...register('message')} />
              </Field>

              <Button type="submit" size="lg" className="w-full">
                Review & Confirm Payment
              </Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="mb-3 font-semibold text-ink">Payment preview</h2>
              <dl className="space-y-2.5 text-sm">
                {[
                  ['Amount', `${amt || 0} ${w.asset}`],
                  ['Value', fmtUsd(amt * (usdRates[w.asset] ?? 1))],
                  ['Network', w.network],
                  ['Est. gas fee', `~${gas} ${w.network.includes('Whitechain') ? 'WBT' : 'ETH'}`],
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
                <span>EIP-5564 Cryptographic Invariant</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                The permanent Stealth Meta-Address is <strong>never</strong> exposed as the destination address on-chain. Each payment generates an unlinkable, single-use secp256k1 address.
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
                  ['Est. gas', `~${gas} ${data.network.includes('Whitechain') ? 'WBT' : 'ETH'}`],
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
                Confirming broadcasts the stealth payment transaction to {data.network} and emits the canonical ERC-5564 announcement.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setPhase('form')}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={confirm}>
                  Confirm & Broadcast
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  )
}
