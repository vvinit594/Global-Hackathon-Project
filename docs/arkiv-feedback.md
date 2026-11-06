# Developer Experience & Feedback for Arkiv Network Team

*Submitted during ETHGlobal Mumbai Hackathon by the Stealth Pay Core Team.*

---

## 1. What Worked Really Well

1. **Clean TypeScript SDK (`@arkiv-network/sdk`):**
   - The SDK was straightforward to install via npm/pnpm and provides typed entity definitions and clean async/await APIs.
2. **Deterministic Entity IDs:**
   - Having structured, unique entity IDs allowed us to seamlessly embed Arkiv identifiers directly into our shareable payment links (`/send?ref=req_arkiv_...`).
3. **Decentralized Expiration (TTL):**
   - Built-in TTL is a killer feature for Web3 invoices. It eliminates the need for cron jobs or custom smart contract expiration logic.

---

## 2. Constructive Feedback & Feature Requests

### A. First-Class Support for Ephemeral Encryption Hooks
- In privacy protocols like ERC-5564, users frequently want to encrypt metadata fields (e.g. invoice memos) using the recipient's viewing public key before storing on Arkiv.
- **Proposal:** Provide built-in asymmetric encryption utilities inside `@arkiv-network/sdk` (e.g. `arkiv.encryptAndPut(data, recipientPublicKey)`).

### B. React Query / SWR Native Hooks
- Frontend developers building dApps frequently wrap Arkiv calls in `@tanstack/react-query`.
- **Proposal:** Ship an official `@arkiv-network/react` package containing hooks like `useArkivEntity(id)` and `useArkivQuery(filters)`.

### C. Direct Viem / Wagmi Wallet Signers
- Allowing the Arkiv SDK to accept an EIP-1193 standard provider (such as Viem's `WalletClient`) directly for writing authenticated records would make dApp integration even faster.
