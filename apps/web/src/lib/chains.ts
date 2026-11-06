import { defineChain, type Chain } from 'viem';
import { sepolia } from 'viem/chains';

export { sepolia };

/**
 * Official Whitechain Testnet Specification
 * Docs: https://docs.whitechain.io/
 */
export const whitechainTestnet: Chain = defineChain({
  id: 2625,
  name: 'Whitechain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'WhiteBIT Coin',
    symbol: 'WBT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.whitechain.io'],
    },
    public: {
      http: ['https://rpc-testnet.whitechain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Whitechain Explorer',
      url: 'https://testnet.whitechainsentry.com',
    },
  },
  testnet: true,
});

/**
 * Arc by Circle Testnet Configuration
 * Docs: https://docs.arc.network/
 */
export const arcTestnet: Chain = defineChain({
  id: 5042, // Arc Testnet Chain ID
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ARC Token',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
    public: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://explorer.testnet.arc.network',
    },
  },
  testnet: true,
});

export const SUPPORTED_CHAINS: readonly [Chain, ...Chain[]] = [whitechainTestnet, sepolia, arcTestnet];

export const DEFAULT_CHAIN: Chain = whitechainTestnet;

/**
 * Verified Token Contracts & Deployments
 */
export const TOKEN_CONTRACTS: Record<number, { USDT?: `0x${string}`; USDC?: `0x${string}` }> = {
  // Whitechain Testnet
  2625: {
    USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', // Testnet USDT on Whitechain
  },
  // Sepolia Testnet
  11155111: {
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
};
