"use client"

import { Link2, LogOut, Wallet as WalletIcon } from 'lucide-react'
import { Badge, Button, Card, Field, Select } from '@/components/ui'
import { CopyButton, PageHeader, DemoNotice } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { networks, usdRates } from '@/data/mock-wallet'
import { useAppStore } from '@/store/app-store'
import { fmtUsd } from '@/utils/format'

export default function WalletPage() {
  const { wallet, connectWallet, disconnectWallet, setNetwork, toast } = useAppStore()

  if (!wallet.connected) {
    return (
      <AppShell>
        <div>
          <PageHeader title="Wallet" description="Connect a wallet to send and receive." />
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            {(
              [
                ['MetaMask', 'Browser extension wallet'],
                ['WalletConnect', 'Scan with a mobile wallet'],
              ] as const
            ).map(([n, d]) => (
              <Card key={n} className="p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-beige text-ink">
                  <WalletIcon className="size-6" />
                </span>
                <h2 className="mt-4 font-semibold text-ink">{n}</h2>
                <p className="text-sm text-ink-soft">{d}</p>
                <Button
                  className="mt-5 w-full"
                  onClick={() => {
                    connectWallet(n)
                    toast(`${n} connected (demo)`)
                  }}
                >
                  Connect {n}
                </Button>
              </Card>
            ))}
          </div>
          <DemoNotice className="mt-4 max-w-3xl" />
        </div>
      </AppShell>
    )
  }

  const total = Object.entries(wallet.balances).reduce(
    (a, [k, v]) => a + v * (usdRates[k] ?? 0),
    0
  )

  return (
    <AppShell>
      <div>
        <PageHeader
          title="Wallet"
          description="Manage your connected wallet."
          action={
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                disconnectWallet()
                toast('Wallet disconnected', 'info')
              }}
            >
              <LogOut className="size-4" /> Disconnect
            </Button>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <Link2 className="size-4" />
                {wallet.provider}
              </span>
              <Badge tone="success">Connected</Badge>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <p className="mb-2 text-xs text-ink-soft">Wallet address</p>
              <p className="font-mono text-xs break-all text-ink">{wallet.address}</p>
            </div>
            <CopyButton text={wallet.address} label="Copy address" />
            <Field label="Active Network">
              <Select
                value={wallet.network}
                onChange={(e) => {
                  setNetwork(e.target.value)
                  toast(`Switched to ${e.target.value}`, 'info')
                }}
              >
                {networks.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </Select>
            </Field>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-ink-soft">Total balance (demo)</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{fmtUsd(total)}</p>
            <ul className="mt-5 divide-y divide-line">
              {Object.entries(wallet.balances).map(([k, v]) => (
                <li key={k} className="flex justify-between py-3 text-sm">
                  <span className="font-medium text-ink">{k}</span>
                  <span className="text-ink">
                    {v.toLocaleString()}{' '}
                    <span className="text-ink-soft">({fmtUsd(v * (usdRates[k] ?? 0))})</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
