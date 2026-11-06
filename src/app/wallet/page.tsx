"use client"

import { ExternalLink, Wallet as WalletIcon, Shield, Radio, CheckCircle2 } from 'lucide-react'
import { Badge, Button, Card, Field, Select } from '@/components/ui'
import { CopyButton, PageHeader, DemoNotice, StealthShieldSymbol } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { fmtUsd, shorten } from '@/utils/format'

export default function WalletPage() {
  const { wallet, connectWallet, disconnectWallet, setNetwork, toast } = useAppStore()

  if (!wallet.connected) {
    return (
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title="Wallet"
            description="Manage your connected wallet or connect a provider."
          />
          <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
            {[
              ['MetaMask', 'Browser extension wallet with EIP-1193 provider'],
              ['WalletConnect', 'Universal bridge for hardware & mobile crypto wallets'],
            ].map(([name, d]) => {
              const n = name as 'MetaMask' | 'WalletConnect'
              return (
                <Card key={n} className="p-6 text-center hover:border-primary/50 transition-all">
                  <div className="mx-auto mb-4 grid size-12 place-items-center rounded-control bg-primary-soft text-primary border border-primary/20">
                    <WalletIcon className="size-6" />
                  </div>
                  <h2 className="font-display font-semibold text-foreground text-base tracking-tight">{n}</h2>
                  <p className="font-sans text-xs text-muted mt-1 leading-relaxed">{d}</p>
                  <Button
                    className="mt-6 w-full text-xs h-10 font-medium"
                    onClick={() => {
                      connectWallet(n)
                      toast(`${n} connected (demo session)`)
                    }}
                  >
                    Connect {n}
                  </Button>
                </Card>
              )
            })}
          </div>
          <DemoNotice className="max-w-2xl" />
        </div>
      </AppShell>
    )
  }

  const ethBalance = wallet.balances['ETH'] ?? 2.48
  const balanceUsd = 4921.0

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Wallet"
          description="Manage connected custodial accounts and network parameters."
        />

        <DemoNotice />

        {/* FORGE / SIGNAL ARCHITECTURAL BALANCE PANEL */}
        <div className="relative overflow-hidden rounded-panel border border-border-strong bg-surface p-6 sm:p-8 shadow-sm">
          {/* Engineering grid accent pattern in background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Geometric Brand Emblem */}
              <div className="grid size-14 place-items-center rounded-card bg-surface-secondary border border-border-strong p-2 text-primary shrink-0 shadow-sm">
                <StealthShieldSymbol className="size-8" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[11px] font-semibold text-muted uppercase tracking-wider">
                    Settled Protocol Balance
                  </p>
                  <span className="font-mono text-[10px] text-accent bg-accent-soft px-1.5 py-0.5 rounded-control font-semibold">
                    EIP-5564
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                    {ethBalance} ETH
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-muted">
                    ≈ ${balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-2 rounded-control bg-accent-soft px-3 py-1.5 font-mono text-xs font-medium text-accent border border-accent/25">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                {wallet.provider || 'MetaMask'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="text-foreground-secondary">Custodian ID:</span>
              <span className="text-foreground">{shorten(wallet.address, 8, 6)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Derivations Active: <strong className="text-accent font-semibold">18 Unlinkable</strong></span>
              <span>Vault Status: <strong className="text-foreground font-semibold">Synchronized</strong></span>
            </div>
          </div>
        </div>

        {/* LOWER ROW: NETWORK & CONNECTED ADDRESS PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Network Panel */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Network Settings</h3>
              <span className="font-mono text-[10px] text-muted uppercase">EVM Layer-1 / L2</span>
            </div>
            <Field label="Active Network" hint="Transactions will broadcast through this EVM provider.">
              <Select
                value={wallet.network}
                onChange={(e) => {
                  setNetwork(e.target.value)
                  toast(`Network switched to ${e.target.value}`, 'info')
                }}
              >
                <option value="Ethereum (Sepolia)">Ethereum (Sepolia)</option>
                <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                <option value="Polygon">Polygon</option>
                <option value="Arbitrum One">Arbitrum One</option>
                <option value="Optimism">Optimism</option>
              </Select>
            </Field>
          </Card>

          {/* Connected Address Panel */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Connected Address</h3>
              <span className="font-mono text-[10px] text-muted uppercase">Custodial EOA</span>
            </div>
            <div className="rounded-control border border-border bg-surface-secondary p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-foreground truncate">
                {wallet.address}
              </span>
              <CopyButton text={wallet.address} label="Copy" className="h-7 px-2.5 text-xs shrink-0" />
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Main custodial address used to fund gas and broadcast one-time stealth derivations.
            </p>
          </Card>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            variant="danger"
            className="w-full sm:w-auto h-10 px-5 text-xs"
            onClick={() => {
              disconnectWallet()
              toast('Wallet disconnected', 'info')
            }}
          >
            Disconnect Wallet
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto h-10 px-5 text-xs"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.open(`https://sepolia.etherscan.io/address/${wallet.address}`, '_blank')
              }
            }}
          >
            <ExternalLink className="size-3.5" /> View on Explorer
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
