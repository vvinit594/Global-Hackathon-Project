import type { WalletState } from '@/types'

export const networks = ['Whitechain Testnet', 'Ethereum Sepolia', 'Arc Testnet', 'Ethereum', 'Polygon']
export const assets = ['USDT', 'ETH', 'WBT', 'USDC']

export const demoWallet: WalletState = {
  connected: true,
  provider: 'MetaMask',
  address: '0x4B1e9c0A7d52F3a8E6c1b9D07fA25e3c8D91a7E2',
  network: 'Whitechain Testnet',
  balances: { USDT: 1500, ETH: 2.4817, WBT: 125.0, USDC: 840 },
}

export const usdRates: Record<string, number> = { USDT: 1, ETH: 3400, WBT: 18.25, USDC: 1 }
export const gasByNetwork: Record<string, number> = {
  'Whitechain Testnet': 0.0001,
  'Ethereum Sepolia': 0.0015,
  'Arc Testnet': 0.0002,
  Ethereum: 0.0021,
  Polygon: 0.01,
}
