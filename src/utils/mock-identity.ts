import type { StealthIdentity } from '@/types'

const hex = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('')

// DEMO ONLY: random hex strings for simulation. NOT real cryptographic keys.
// Sensitive private keys are strictly memory-only and never stored in localStorage/sessionStorage.
export function generateDemoIdentity(): StealthIdentity {
  const spendingKey = '0x02' + hex(64)
  const viewingKey = '0x03' + hex(64)
  const spendingPrivateKey = '0x' + hex(64)
  const viewingPrivateKey = '0x' + hex(64)
  return {
    spendingKey,
    viewingKey,
    spendingPrivateKey,
    viewingPrivateKey,
    metaAddress: `st:eth:${spendingKey}${viewingKey.slice(2)}`,
    createdAt: new Date().toISOString(),
  }
}
