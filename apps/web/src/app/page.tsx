"use client"

import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  QrCode,
  Send,
  ShieldCheck,
  Zap,
  Layers,
  Network,
  Bell,
} from 'lucide-react'
import { MarketingFooter, MarketingNav } from '@/components/layout/marketing'
import { Button, Card } from '@/components/ui'

const steps = [
  ['Create your stealth identity', 'Generate a meta-address made of a public spending key and a public viewing key.'],
  ['Share it or a QR code', 'Anyone can pay you using that one reusable address.'],
  ['Sender derives a one-time address', 'Each payment goes to a fresh address that cannot be linked back to you.'],
  ['You detect and collect', 'Your viewing key finds incoming payments; your spending key controls them.'],
]

const features = [
  [Fingerprint, 'Stealth identity', 'One reusable meta-address for all incoming payments.'],
  [QrCode, 'QR and payment links', 'Request exact amounts with a scannable code.'],
  [Network, 'Multi-network', 'Choose Ethereum, Polygon, Arbitrum or Optimism.'],
  [Zap, 'Gas estimates', 'See estimated network fees before you confirm.'],
  [Bell, 'Smart notifications', 'Know when payments arrive, confirm, or fail.'],
  [Layers, 'Clean history', 'Filter and inspect every transaction in one place.'],
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <MarketingNav />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-3.5 py-1.5 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-sage-deep" /> Privacy-first payments
          </span>
          <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl text-ink">
            Get paid without exposing your wallet.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Stealth Pay gives you one shareable identity while every payment lands on a fresh, unlinkable address.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">
                Get started <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="ghost">
                See how it works
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-ink-soft">
            Frontend prototype with demo data. Not connected to a live blockchain.
          </p>
        </div>
        <Card className="space-y-4 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">Stealth meta-address</span>
            <span className="rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-ink">Active</span>
          </div>
          <p className="rounded-2xl bg-canvas p-4 font-mono text-xs break-all text-ink-soft">
            st:eth:0x02a91cf3e7d0b4c82a7b8e19d0384bc910283749bcf819028374900a
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-beige-soft p-4">
              <p className="text-xs text-ink-soft">Shielded balance</p>
              <p className="mt-1 text-xl font-semibold text-ink">$2,940</p>
            </div>
            <div className="rounded-2xl bg-sage-soft p-4">
              <p className="text-xs text-ink-soft">One-time addresses</p>
              <p className="mt-1 text-xl font-semibold text-ink">38</p>
            </div>
          </div>
        </Card>
      </section>

      <section id="problem" className="border-y border-line bg-card py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-2">
          <div className="rounded-3xl bg-beige-soft p-8">
            <EyeOff className="mb-4 size-6 text-ink" />
            <h2 className="text-2xl font-semibold text-ink">The problem</h2>
            <p className="mt-3 text-ink-soft leading-relaxed">
              Public blockchains expose every balance and counterparty. Share one address and anyone can trace your income, spending, and financial relationships.
            </p>
          </div>
          <div className="rounded-3xl bg-sage-soft p-8">
            <Lock className="mb-4 size-6 text-ink" />
            <h2 className="text-2xl font-semibold text-ink">The solution</h2>
            <p className="mt-3 text-ink-soft leading-relaxed">
              Stealth addresses let senders derive a unique destination for every payment from your meta-address, so on-chain activity cannot be linked to you.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">How Stealth Pay works</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <Card key={t} className="p-6">
              <span className="grid size-9 place-items-center rounded-full bg-sage font-semibold text-ink">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="bg-card py-20 border-y border-line">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Features</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([I, t, d]) => (
              <div key={t} className="rounded-3xl border border-line p-6 bg-card transition hover:border-sage-deep hover:shadow-soft">
                <span className="grid size-11 place-items-center rounded-2xl bg-beige text-ink">
                  <I className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{t}</h3>
                <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Privacy and security</h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Designed so that you stay in control. Cryptography and transaction processing will be provided by the backend and smart contract layer in the full product.
          </p>
        </div>
        <div className="space-y-3">
          {[
            [KeyRound, 'Separate spending and viewing keys'],
            [Eye, 'View-only scanning for incoming payments'],
            [ShieldCheck, 'Non-custodial by design'],
          ].map(([I, t]) => {
            const Icon = I as typeof Lock
            return (
              <div key={t as string} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-sage text-ink">
                  <Icon className="size-5" />
                </span>
                <span className="font-medium text-ink">{t as string}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section id="docs" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-beige p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <BookOpen className="mb-3 size-6 text-ink" />
            <h2 className="text-2xl font-semibold text-ink">Documentation</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-soft">
              Guides for stealth identities, sending, receiving, and integrating the upcoming API. Docs are coming with the backend release.
            </p>
          </div>
          <Link to="/dashboard">
            <Button className="bg-card text-ink hover:bg-white hover:text-ink">
              <Send className="size-4" /> Try the demo
            </Button>
          </Link>
        </div>
      </section>
      <MarketingFooter />
    </div>
  )
}
