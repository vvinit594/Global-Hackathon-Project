import type { WalletState } from '@/types'

export const networks = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism']
export const assets = ['ETH', 'USDC', 'USDT', 'MATIC']

export const demoWallet: WalletState = {
  connected: true,
  provider: 'MetaMask',
  address: '0x4B1e9c0A7d52F3a8E6c1b9D07fA25e3c8D91a7E2',
  network: 'Ethereum',
  balances: { ETH: 2.4817, USDC: 1840.5, USDT: 620, MATIC: 410.25 },
}

export const usdRates: Record<string, number> = { ETH: 3400, USDC: 1, USDT: 1, MATIC: 0.7 }
export const gasByNetwork: Record<string, number> = { Ethereum: 0.0021, Polygon: 0.01, Arbitrum: 0.0003, Optimism: 0.0004 }
