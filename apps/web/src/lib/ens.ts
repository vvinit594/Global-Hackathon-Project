import { createPublicClient, http } from 'viem';
import { normalize } from 'viem/ens';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env['MAINNET_RPC_URL'] ?? 'https://cloudflare-eth.com'),
});

export interface EnsResolutionResult {
  name: string;
  address: `0x${string}` | null;
  stealthMetaAddress: string | null;
  avatar: string | null;
  resolved: boolean;
  error?: string;
}

/**
 * Resolves an ENS domain name to its Ethereum address and looks up
 * any ERC-5564 stealth meta-address stored in ENS text records.
 */
export async function resolveEnsName(ensName: string): Promise<EnsResolutionResult> {
  const cleanName = ensName.trim().toLowerCase();

  if (!cleanName.endsWith('.eth')) {
    return {
      name: cleanName,
      address: null,
      stealthMetaAddress: null,
      avatar: null,
      resolved: false,
      error: 'Not a valid .eth domain name.',
    };
  }

  try {
    const normalized = normalize(cleanName);

    // 1. Resolve primary address
    const address = await ensClient.getEnsAddress({
      name: normalized,
    });

    if (!address) {
      return {
        name: cleanName,
        address: null,
        stealthMetaAddress: null,
        avatar: null,
        resolved: false,
        error: 'ENS name not found or unassigned.',
      };
    }

    // 2. Query text record for stealth meta-address
    let stealthMetaAddress: string | null = null;
    try {
      stealthMetaAddress = await ensClient.getEnsText({
        name: normalized,
        key: 'stealth-meta-address',
      });
    } catch {
      // Record not set
    }

    // 3. Optional avatar
    let avatar: string | null = null;
    try {
      avatar = await ensClient.getEnsAvatar({
        name: normalized,
      });
    } catch {
      // Avatar not set
    }

    return {
      name: cleanName,
      address,
      stealthMetaAddress: stealthMetaAddress || null,
      avatar,
      resolved: true,
    };
  } catch (err) {
    return {
      name: cleanName,
      address: null,
      stealthMetaAddress: null,
      avatar: null,
      resolved: false,
      error: err instanceof Error ? err.message : 'ENS resolution failed.',
    };
  }
}
