'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { Database, Network, Globe, ArrowLeftRight, Coins, ExternalLink, CheckCircle, Clock } from 'lucide-react';

export interface EcosystemPlatform {
  id: string;
  name: string;
  role: string;
  status: 'Connected' | 'Implemented' | 'Available' | 'Planned' | 'Not configured';
  tone: 'success' | 'warn' | 'neutral' | 'danger';
  feature: string;
  networkDetails: string;
  docUrl: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ECOSYSTEM_PLATFORMS: EcosystemPlatform[] = [
  {
    id: 'arkiv',
    name: 'Arkiv Network',
    role: 'Decentralized Data Layer',
    status: 'Implemented',
    tone: 'success',
    feature: 'Stealth Identity Registry, Expiring Payment Requests & Merchant Directory',
    networkDetails: 'Arkiv Testnet (RPC: rpc-testnet.arkiv.network)',
    docUrl: 'https://docs.arkiv.network/',
    icon: Database,
  },
  {
    id: 'whitechain',
    name: 'Whitechain',
    role: 'Primary Payment Network',
    status: 'Connected',
    tone: 'success',
    feature: 'USDT Stealth Transfers, Low-Fee Settlement & Atomic Announcer',
    networkDetails: 'Whitechain Testnet (Chain ID: 2625)',
    docUrl: 'https://docs.whitechain.io/',
    icon: Network,
  },
  {
    id: 'ens',
    name: 'Ethereum Name Service (ENS)',
    role: 'Human-Readable Identity',
    status: 'Implemented',
    tone: 'success',
    feature: 'ENS Name Lookup & stealth-meta-address Text Record Resolution',
    networkDetails: 'Ethereum Mainnet / Sepolia Resolver',
    docUrl: 'https://docs.ens.domains/',
    icon: Globe,
  },
  {
    id: 'uniswap',
    name: 'Uniswap v3',
    role: 'DEX Token Swaps',
    status: 'Available',
    tone: 'success',
    feature: 'Live Pre-Payment Token Conversion (ETH/WBT → USDT) with Slippage Protection',
    networkDetails: 'Uniswap Quoter v2 Protocol',
    docUrl: 'https://developers.uniswap.org/docs',
    icon: ArrowLeftRight,
  },
  {
    id: 'arc',
    name: 'Arc by Circle',
    role: 'Stablecoin Infrastructure',
    status: 'Planned',
    tone: 'warn',
    feature: 'USDC Programmable Wallets & Cross-Chain Stablecoin Settlement',
    networkDetails: 'Arc Testnet (Chain ID: 5042 - Architectural Blueprint Ready)',
    docUrl: 'https://docs.arc.network/',
    icon: Coins,
  },
];

export function EcosystemHub(): React.JSX.Element {
  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Ecosystem Integrations Hub</h2>
          <p className="text-sm text-ink-soft">
            Live Web3 protocol integrations powering privacy, decentralized storage, and payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">
            <CheckCircle className="mr-1 size-3 inline" /> 4 Active Protocols
          </Badge>
          <Badge tone="warn">
            <Clock className="mr-1 size-3 inline" /> 1 Planned
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ECOSYSTEM_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-card p-5 transition-shadow hover:shadow-soft"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-xl bg-sage-soft text-ink">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">{platform.name}</h3>
                      <p className="text-xs text-ink-soft">{platform.role}</p>
                    </div>
                  </div>
                  <Badge tone={platform.tone}>{platform.status}</Badge>
                </div>

                <div className="space-y-1.5 border-t border-line/60 pt-3">
                  <p className="text-xs font-medium text-ink-soft">Capability:</p>
                  <p className="text-xs leading-relaxed text-ink">{platform.feature}</p>
                </div>

                <div className="rounded-xl bg-canvas p-2.5 text-[11px] text-ink-soft font-mono">
                  {platform.networkDetails}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between">
                <a
                  href={platform.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink transition-colors"
                >
                  Documentation <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
