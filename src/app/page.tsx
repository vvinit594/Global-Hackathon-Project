"use client"

import Link from 'next/link'
import {
  ArrowRight,
  EyeOff,
  Fingerprint,
  Lock,
  QrCode,
  ShieldCheck,
  Zap,
  Layers,
  Network,
  Bell,
  RefreshCw,
} from 'lucide-react'
import { MarketingFooter, MarketingNav } from '@/components/layout/marketing'
import { Button, Card } from '@/components/ui'
import { StealthShieldSymbol } from '@/components/common'

const steps = [
  ['Generate Stealth Identity', 'Derive a permanent meta-address containing a public spending key and viewing key via secp256k1 curve.'],
  ['Publish Meta-Address', 'Share your permanent public meta-address safely anywhere. It never reveals on-chain transaction history.'],
  ['Non-Interactive Derivation', 'Each sender automatically derives a unique, disposable one-time stealth destination address via Diffie-Hellman.'],
  ['Scan & Claim Privately', 'Your viewing key detects incoming mempool payments without spending authority, while your spending key claims funds.'],
]

const features = [
  [Fingerprint, 'Stealth Identity', 'Reusable EIP-5564 meta-address eliminating public wallet address exposure.'],
  [QrCode, 'Dynamic QR Links', 'Standardized payment payloads with instant cryptographic parameter parsing.'],
  [Network, 'Multi-Network Ready', 'Engineered for Ethereum, Arbitrum, Optimism, and Polygon EVM chains.'],
  [Zap, 'Pre-Flight Gas Estimation', 'Accurate execution fee previews before committing ephemeral key announcements.'],
  [Bell, 'Viewing Key Telemetry', 'Live detection notifications as incoming transfers hit the mempool.'],
  [Layers, 'Immutable Vault Registry', 'Cryptographically track one-time addresses from GENERATED to USED.'],
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden transition-colors duration-200">
      <div className="relative z-10 flex min-h-screen flex-col">
        <MarketingNav />

        {/* HERO SECTION */}
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-12 sm:pt-20 sm:pb-16" id="overview">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-mono text-[var(--foreground-secondary)] shadow-sm">
                <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                <span>EIP-5564 SPECIFICATION IMPLEMENTATION</span>
              </div>

              <h1 className="mt-5 font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
                Engineered Privacy.
                <br />
                <span className="text-[var(--primary)]">Clear Financial Control.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm sm:text-base text-[var(--foreground-secondary)] leading-relaxed">
                Stealth Pay introduces cryptographic destination blinding for Ethereum. Every transfer lands on an unlinkable, single-use address generated from the recipient’s permanent meta-address.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-7 font-mono text-xs">
                    Initialize Identity <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <a href="#protocol">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 font-mono text-xs">
                    Protocol Details
                  </Button>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs font-mono text-[var(--muted)]">
                <span>NON-CUSTODIAL</span>
                <span>•</span>
                <span>IN-MEMORY SECRETS</span>
                <span>•</span>
                <span>ZERO LINKAGE</span>
              </div>
            </div>

            {/* Right: Architectural Geometric Shield Card */}
            <div className="flex items-center justify-center py-4 lg:py-0">
              <div className="w-full max-w-sm rounded-panel border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[var(--color-card-shadow)]">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <StealthShieldSymbol className="size-4 text-[var(--primary)]" />
                    <span className="text-xs font-mono font-semibold tracking-wider text-[var(--foreground)]">
                      FORGE / SIGNAL ENGINE
                    </span>
                  </div>
                  <span className="rounded-control bg-[var(--badge-success-bg)] px-2 py-0.5 text-[10px] font-mono font-medium text-[var(--badge-success-text)] border border-[var(--badge-success-border)]">
                    VERIFIED
                  </span>
                </div>

                {/* Center Symbol Display */}
                <div className="my-6 rounded-card border border-[var(--border)] bg-[var(--surface-secondary)] p-6 flex flex-col items-center justify-center text-center">
                  <div className="size-16 grid place-items-center rounded-control bg-[var(--surface)] border border-[var(--border-strong)] mb-3 shadow-sm">
                    <StealthShieldSymbol className="size-10 text-[var(--primary)]" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-[var(--foreground)]">
                    STEALTH DESTINATION DERIVATION
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted)] mt-0.5">
                    P = H(r · K_view) · G + K_spend
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5">
                    <span className="text-[10px] uppercase text-[var(--muted)] block">Receiver Meta-Address (Permanent)</span>
                    <span className="text-xs text-[var(--foreground)] truncate block mt-0.5">
                      st:eth:0x028c9fe47b9938dcb90184bba01948bc89...
                    </span>
                  </div>
                  <div className="rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5">
                    <span className="text-[10px] uppercase text-[var(--primary)] font-semibold block">Derived One-Time Stealth Target</span>
                    <span className="text-xs text-[var(--accent)] font-semibold truncate block mt-0.5">
                      0x7a3c9df10283749bcf819028374900aef1234
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FEATURE PILLS */}
          <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                title: 'Permanent Reusable Identity',
                desc: 'Share one public meta-address without on-chain trail.',
                icon: Fingerprint,
              },
              {
                title: 'Cryptographic Unlinkability',
                desc: 'Every payment routes to a unique, single-use EVM address.',
                icon: RefreshCw,
              },
              {
                title: 'Zero Custodial Risk',
                desc: 'Private keys remain in client memory and are never broadcasted.',
                icon: ShieldCheck,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--color-card-shadow)]"
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-control bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--primary)]">
                  <f.icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEM & SOLUTION SECTION */}
        <section id="architecture" className="border-y border-[var(--border)] bg-[var(--surface-secondary)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--primary)]">
                PROTOCOL ANALYSIS
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                The Public Ledger Dilemma & Solution
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--foreground-secondary)]">
                Eliminating financial profiling without complex layer-2 mixers or custodial intermediaries.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-panel border border-[var(--border-strong)] bg-[var(--surface)] p-6 sm:p-7 shadow-sm">
                <div className="grid size-9 place-items-center rounded-control bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border border-[var(--badge-danger-border)] mb-4">
                  <EyeOff className="size-4" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--foreground)]">
                  Vulnerability: Public Ledger Surveillance
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  When you share a standard Ethereum address with a client or sender, your entire financial history, asset balance, and counterparty graph are permanently exposed to public block explorers.
                </p>
              </div>

              <div className="rounded-panel border border-[var(--primary)]/40 bg-[var(--surface)] p-6 sm:p-7 shadow-sm">
                <div className="grid size-9 place-items-center rounded-control bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)] mb-4">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--foreground)]">
                  Resolution: EIP-5564 Stealth Blind Destinations
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  Stealth Pay implements non-interactive Diffie-Hellman key exchange. Senders derive an unpredictable, fresh destination address from the receiver&apos;s meta-address that only the recipient can detect and spend.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="protocol" className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--primary)]">
                EXECUTION FLOW
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Cryptographic Workflow
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--foreground-secondary)]">
                Four mathematically verified stages from key generation to fund redemption.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(([t, d], i) => (
                <div
                  key={t}
                  className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--border-strong)] transition-all"
                >
                  <span className="inline-block rounded-control bg-[var(--surface-secondary)] border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--primary)]">
                    STAGE 0{i + 1}
                  </span>
                  <h3 className="font-display mt-3 text-sm font-bold text-[var(--foreground)]">{t}</h3>
                  <p className="mt-1.5 text-xs text-[var(--foreground-secondary)] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="security" className="border-t border-[var(--border)] bg-[var(--surface-secondary)] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--primary)]">
                INFRASTRUCTURE SPECIFICATIONS
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                Engineered for Institutional Precision
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--foreground-secondary)]">
                Architected with strict mathematical separation between viewing and spending authorities.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, title, desc]) => (
                <div
                  key={title}
                  className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm hover:border-[var(--border-strong)] transition-all"
                >
                  <div className="grid size-8 place-items-center rounded-control bg-[var(--surface-secondary)] text-[var(--primary)] border border-[var(--border)] mb-3">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="font-display text-sm font-bold text-[var(--foreground)]">{title}</h3>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="rounded-panel border border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center sm:p-12 shadow-[var(--color-card-shadow)]">
              <div className="max-w-xl mx-auto">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[var(--primary)]">
                  READY FOR EVALUATION
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                  Evaluate the Stealth Pay Protocol Prototype
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  Generate an EIP-5564 stealth identity, simulate incoming mempool transfer detections, and inspect disposable address lifecycles.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link href="/register">
                    <Button size="lg" className="px-6 font-mono text-xs">
                      Initialize Demo Workspace <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </div>
  )
}
