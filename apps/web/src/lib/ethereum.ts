import { createPublicClient, http, type PublicClient } from 'viem';
import { sepolia } from 'viem/chains';

let _publicClient: PublicClient | null = null;

export function getEthereumPublicClient(rpcUrl?: string): PublicClient {
  const url = rpcUrl ?? process.env['ETHEREUM_RPC_URL'] ?? process.env['NEXT_PUBLIC_RPC_URL'] ?? 'https://rpc.sepolia.org';

  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: sepolia,
      transport: http(url),
    });
  }

  return _publicClient;
}

/**
 * Standard ERC-5564 Announcer contract event ABI
 * event Announcement(
 *   uint256 indexed schemeId,
 *   address indexed stealthAddress,
 *   address indexed caller,
 *   bytes ephemeralPubKey,
 *   bytes metadata
 * )
 */
export const ERC5564_ANNOUNCER_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'schemeId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'stealthAddress', type: 'address' },
      { indexed: true, internalType: 'address', name: 'caller', type: 'address' },
      { indexed: false, internalType: 'bytes', name: 'ephemeralPubKey', type: 'bytes' },
      { indexed: false, internalType: 'bytes', name: 'metadata', type: 'bytes' },
    ],
    name: 'Announcement',
    type: 'event',
  },
] as const;

