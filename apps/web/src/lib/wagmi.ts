import { http, createConfig, injected } from 'wagmi';
import { whitechainTestnet, sepolia, arcTestnet } from './chains';

export const wagmiConfig: any = createConfig({
  chains: [whitechainTestnet, sepolia, arcTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [whitechainTestnet.id]: http('https://rpc-testnet.whitechain.io'),
    [sepolia.id]: http(process.env['NEXT_PUBLIC_RPC_URL'] ?? 'https://rpc.sepolia.org'),
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
  ssr: true,
});
