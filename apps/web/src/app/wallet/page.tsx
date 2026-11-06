"use client"

import { useState } from 'react'
import { Link2, LogOut, Wallet as WalletIcon, ShieldCheck, CheckCircle2, Globe, ArrowRightLeft } from 'lucide-react'
import { Badge, Button, Card, Field, Select } from '@/components/ui'
import { CopyButton, PageHeader, DemoNotice } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { networks, usdRates } from '@/data/mock-wallet'
import { useAppStore } from '@/store/app-store'
import { fmtUsd, shorten } from '@/utils/format'
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'

export default function WalletPage() {
  const { wallet, connectWallet, disconnectWallet, setNetwork, toast } = useAppStore()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: onChainBalance } = useBalance({ address })

  // Handle real Web3 connection
  const handleConnectInjected = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected') || connectors[0]
    if (injectedConnector) {
      connect({ connector: injectedConnector })
      toast('Connecting to browser Web3 wallet...', 'info')
    } else {
      toast('No Web3 wallet extension found. Using simulated wallet.', 'info')
      connectWallet('MetaMask')
    }
  }

  const isWalletActive = wallet.connected || isConnected
  const activeAddress = address || wallet.address
  const activeProvider = isConnected ? 'MetaMask / Injected' : wallet.provider

  if (!isWalletActive) {
    return (
      <AppShell>
        <div>
          <PageHeader title="Wallet" description="Connect your Web3 wallet to send and receive stealth payments." />
          <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-beige text-ink">
                <WalletIcon className="size-6 text-amber-700" />
              </span>
              <h2 className="mt-4 font-semibold text-ink">Browser Web3 Wallet</h2>
              <p className="text-sm text-ink-soft">
                Connect MetaMask, Rabby, Brave, or any EIP-1193 browser extension on Whitechain or Sepolia.
              </p>
              <Button
                className="mt-5 w-full bg-sage-deep hover:bg-sage-dark text-white"
                onClick={handleConnectInjected}
              >
                Connect Browser Wallet
              </Button>
            </Card>

            <Card key="demo" className="p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-canvas text-ink">
                <ShieldCheck className="size-6 text-sage-deep" />
              </span>
              <h2 className="mt-4 font-semibold text-ink">Simulated Hackathon Wallet</h2>
              <p className="text-sm text-ink-soft">
                Pre-funded sandbox wallet for testing stealth transfers without external gas or signatures.
              </p>
              <Button
                variant="secondary"
                className="mt-5 w-full"
                onClick={() => {
                  connectWallet('MetaMask')
                  toast('Demo sandbox wallet connected', 'success')
                }}
              >
                Connect Demo Wallet
              </Button>
            </Card>
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
          description="Manage your connected Web3 and privacy account."
          action={
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (isConnected) disconnect()
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
                {activeProvider}
              </span>
              <Badge tone="success">
                {isConnected ? 'On-Chain Active' : 'Simulated Active'}
              </Badge>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <p className="mb-2 text-xs text-ink-soft">Connected Address</p>
              <p className="font-mono text-xs break-all text-ink">{activeAddress}</p>
            </div>
            <CopyButton text={activeAddress} label="Copy address" />

            <Field label="Active Payment Network">
              <Select
                value={wallet.network}
                onChange={(e) => {
                  const targetNet = e.target.value
                  setNetwork(targetNet)
                  if (targetNet.includes('Whitechain') && switchChain) {
                    switchChain({ chainId: 2625 })
                  } else if (targetNet.includes('Sepolia') && switchChain) {
                    switchChain({ chainId: 11155111 })
                  }
                  toast(`Switched network to ${targetNet}`, 'info')
                }}
              >
                <option value="Whitechain Testnet">Whitechain Testnet (Chain ID 2625 - WBT)</option>
                <option value="Sepolia">Ethereum Sepolia (Chain ID 11155111 - ETH)</option>
                <option value="Arc Testnet">Arc Testnet (Chain ID 5042 - USDC)</option>
                <option value="Ethereum">Ethereum Mainnet</option>
              </Select>
            </Field>

            {chain && (
              <div className="rounded-xl bg-sage-soft p-3 text-xs text-ink flex items-center justify-between">
                <span>EVM Chain Connected:</span>
                <span className="font-semibold">{chain.name} ({chain.id})</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-sm text-ink-soft">Total Available Balance</p>
            <p className="mt-1 text-3xl font-semibold text-ink">
              {onChainBalance
                ? `${(Number(onChainBalance.value) / 10 ** onChainBalance.decimals).toFixed(4)} ${onChainBalance.symbol}`
                : fmtUsd(total)}
            </p>

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
