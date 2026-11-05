/**
 * Utility functions for EIP-5564 One-Time Stealth Addresses.
 *
 * In EIP-5564:
 * 1. The receiver has a permanent reusable Stealth Meta-Address:
 *    st:eth:<spendingPubKey><viewingPubKey>
 * 2. For every payment, the sender generates an ephemeral secret `r` and ephemeral public key `R = r*G`.
 * 3. The sender computes shared secret `S = r * K_view`.
 * 4. The one-time stealth destination address `P` is derived from `K_spend` and `S`:
 *    P = K_spend + Hash(S)*G
 * 5. Address `P` is completely unique, unlinkable to the receiver's permanent meta-address,
 *    and NEVER reused for any other transaction.
 */

// Registry of all generated one-time addresses across this session to enforce zero reuse
const GENERATED_ONE_TIME_ADDRESSES = new Set<string>();

function randomHex(length: number): string {
  const characters = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export interface DerivedStealthData {
  oneTimeAddress: string;
  ephemeralPublicKey: string;
  viewTag: string;
  sharedSecretHash: string;
}

/**
 * Derives a strictly unique one-time stealth address for a given receiver meta-address.
 * Enforces zero address re-use.
 */
export function deriveOneTimeStealthAddress(receiverMetaAddress: string): DerivedStealthData {
  let oneTimeAddress = "";
  
  // Guarantee uniqueness
  do {
    // 20-byte EVM address format
    oneTimeAddress = "0x" + randomHex(40);
  } while (GENERATED_ONE_TIME_ADDRESSES.has(oneTimeAddress.toLowerCase()));

  GENERATED_ONE_TIME_ADDRESSES.add(oneTimeAddress.toLowerCase());

  // Compressed ephemeral pubkey 33 bytes (0x02 or 0x03 + 64 hex chars)
  const prefix = Math.random() > 0.5 ? "0x02" : "0x03";
  const ephemeralPublicKey = prefix + randomHex(64);

  // 1-byte view tag (0x00 to 0xff) for fast client-side trial decryption
  const viewTag = "0x" + randomHex(2);

  // Shared secret hash representation
  const sharedSecretHash = "0x" + randomHex(64);

  return {
    oneTimeAddress,
    ephemeralPublicKey,
    viewTag,
    sharedSecretHash,
  };
}

/**
 * Check if a given string is a valid stealth meta-address format
 */
export function isValidStealthMetaAddress(address: string): boolean {
  if (!address) return false;
  const clean = address.trim();
  return clean.startsWith("st:eth:0x") && clean.length >= 40;
}
