import type { StealthIdentity } from '@/types';
import * as secp from '@noble/secp256k1';
import { toHex } from 'viem';

/**
 * Generates a real ERC-5564 compliant Stealth Identity using secp256k1.
 * Order: st:eth:0x<spendingPubKey><viewingPubKey>
 */
export function generateRealStealthIdentity(): StealthIdentity {
  // Generate private keys
  const spendPriv = secp.utils.randomPrivateKey();
  const viewPriv = secp.utils.randomPrivateKey();

  // Generate public keys (33-byte compressed)
  const spendPub = secp.getPublicKey(spendPriv, true);
  const viewPub = secp.getPublicKey(viewPriv, true);

  const spendingKey = toHex(spendPub); // 0x<66 chars>
  const viewingKey = toHex(viewPub);   // 0x<66 chars>

  // Format: st:eth:0x<spendingPubKey(66)><viewingPubKey(66 without 0x)>
  const metaAddress = `st:eth:${spendingKey}${viewingKey.slice(2)}`;

  return {
    spendingKey,
    viewingKey,
    metaAddress,
    createdAt: new Date().toISOString(),
  };
}

export const generateDemoIdentity = generateRealStealthIdentity;
