/**
 * ERC-5564 Stealth Address Cryptography Engine
 *
 * Implements:
 * 1. Meta-Address Format: st:eth:0x<spendingPubKey><viewingPubKey> (Order: Ps first, Pv second)
 * 2. Sender Derivation: Ephemeral key (r, R), ECDH Shared Secret S = r * Pv, P_stealth = Ps + hash(S)*G, A_stealth
 * 3. Receiver Detection & Key Recovery: S = a * R, p = (b + hash(S)) mod n
 */

import * as secp from '@noble/secp256k1';
import { keccak256, toHex, hexToBytes, isAddress } from 'viem';

export interface StealthMetaAddressComponents {
  spendingPublicKey: string; // Ps (33 bytes compressed, 0x02 or 0x03)
  viewingPublicKey: string;  // Pv (33 bytes compressed, 0x02 or 0x03)
  valid: boolean;
}

export interface DerivedStealthData {
  oneTimeAddress: `0x${string}`;
  ephemeralPublicKey: `0x${string}`; // R = r·G (33-byte compressed)
  viewTag: `0x${string}`;            // First byte of hash(S)
  sharedSecretHash: `0x${string}`;
}

export interface RecoveredStealthKey {
  stealthPrivateKey: `0x${string}`;
  stealthAddress: `0x${string}`;
}

/**
 * Parses and validates an ERC-5564 Stealth Meta-Address URI.
 * Format: st:eth:0x<spendingPubKey><viewingPubKey>
 */
export function parseStealthMetaAddress(metaAddressURI: string): StealthMetaAddressComponents {
  const clean = metaAddressURI.trim();
  const match = clean.match(/^st:[a-zA-Z0-9]+:0x([0-9a-fA-F]{132})$/);
  if (!match || !match[1]) {
    return { spendingPublicKey: '', viewingPublicKey: '', valid: false };
  }

  const hex132 = match[1];
  const spendingPublicKey = `0x${hex132.slice(0, 66)}`;
  const viewingPublicKey = `0x${hex132.slice(66, 132)}`;

  const isValidFormat = (k: string) => /^(0x)(02|03)[0-9a-fA-F]{64}$/.test(k);

  return {
    spendingPublicKey,
    viewingPublicKey,
    valid: isValidFormat(spendingPublicKey) && isValidFormat(viewingPublicKey),
  };
}

export function isValidStealthMetaAddress(metaAddressURI: string): boolean {
  return parseStealthMetaAddress(metaAddressURI).valid;
}

/**
 * Derives a strictly unique one-time stealth address according to ERC-5564.
 */
export function deriveOneTimeStealthAddress(receiverMetaAddress: string): DerivedStealthData {
  const parsed = parseStealthMetaAddress(receiverMetaAddress);
  if (!parsed.valid) {
    throw new Error('Invalid ERC-5564 stealth meta-address URI format.');
  }

  // 1. Generate fresh ephemeral private key r ∈ [1, n-1]
  const ephemeralPrivKey = secp.utils.randomPrivateKey();
  const ephemeralPrivHex = toHex(ephemeralPrivKey);

  // 2. Compute ephemeral public key R = r·G (compressed 33 bytes)
  const R_bytes = secp.getPublicKey(ephemeralPrivKey, true);
  const ephemeralPublicKey = toHex(R_bytes) as `0x${string}`;

  // 3. Compute shared secret S = r · Pv
  const Pv_bytes = hexToBytes(parsed.viewingPublicKey as `0x${string}`);
  const S_point = secp.Point.fromHex(Pv_bytes).multiply(BigInt(ephemeralPrivHex));
  const S_bytes = S_point.toRawBytes(true);

  // 4. Compute hash(S) and view tag (first byte)
  const sharedSecretHash = keccak256(toHex(S_bytes));
  const viewTag = `0x${sharedSecretHash.slice(2, 4)}` as `0x${string}`;

  // 5. Derive stealth public key: P_stealth = Ps + hash(S)·G
  const Ps_point = secp.Point.fromHex(hexToBytes(parsed.spendingPublicKey as `0x${string}`));
  const tweak_point = secp.Point.fromPrivateKey(hexToBytes(sharedSecretHash));
  const P_stealth = Ps_point.add(tweak_point);

  // 6. Convert uncompressed public key to Ethereum address
  // Address is the last 20 bytes of keccak256 of the uncompressed public key (excluding 0x04 prefix)
  const uncompressed = P_stealth.toRawBytes(false); // 65 bytes
  const pubBytesWithoutPrefix = uncompressed.slice(1);
  const addressHash = keccak256(toHex(pubBytesWithoutPrefix));
  const oneTimeAddress = `0x${addressHash.slice(26)}` as `0x${string}`;

  return {
    oneTimeAddress,
    ephemeralPublicKey,
    viewTag,
    sharedSecretHash,
  };
}

/**
 * Receiver Recovery: Computes the stealth private key to sign transactions from the stealth address.
 * p = (b + hash(S)) mod n
 */
export function recoverStealthPrivateKey(params: {
  spendingPrivateKey: `0x${string}`;
  viewingPrivateKey: `0x${string}`;
  ephemeralPublicKey: `0x${string}`;
}): RecoveredStealthKey {
  const { spendingPrivateKey, viewingPrivateKey, ephemeralPublicKey } = params;

  // S = a · R
  const R_point = secp.Point.fromHex(hexToBytes(ephemeralPublicKey));
  const S_point = R_point.multiply(BigInt(viewingPrivateKey));
  const S_bytes = S_point.toRawBytes(true);

  const sharedSecretHash = keccak256(toHex(S_bytes));
  const tweak = BigInt(sharedSecretHash);
  const b = BigInt(spendingPrivateKey);
  const n = secp.CURVE.n;

  // p = (b + tweak) mod n
  const p = ((b + tweak) % n + n) % n;
  const stealthPrivateKey = `0x${p.toString(16).padStart(64, '0')}` as `0x${string}`;

  // Derive address to verify match
  const pub = secp.getPublicKey(hexToBytes(stealthPrivateKey), false).slice(1);
  const stealthAddress = `0x${keccak256(toHex(pub)).slice(26)}` as `0x${string}`;

  return {
    stealthPrivateKey,
    stealthAddress,
  };
}
