# Why Arkiv Network for Stealth Pay?

## The Problem with Traditional Storage in Web3 Privacy Payments

Privacy-preserving payment systems face a core architectural dilemma:

1. **Centralized Databases (e.g. Supabase, PostgreSQL):**
   - High performance, but introduces a single point of failure and centralized tracking.
   - Centralized operators can censor merchant payment requests, correlate IP addresses with stealth queries, or suffer database leaks.
2. **Standard Decentralized Storage (IPFS / Arweave):**
   - **Immutable Permanence Problem:** On IPFS or Arweave, once an invoice or payment request is pinned, it stays forever. If a merchant creates an invoice with an expiration date, it cannot be safely pruned or expired.
   - **Slow Indexing:** Querying IPFS for active payment requests by merchant category requires building an external indexer, creating a secondary centralized dependency.
3. **Smart Contract Storage (On-Chain EVM):**
   - Storing payment request strings, descriptions, and directories on L1/L2 smart contracts incurs prohibitive gas costs.

---

## How Arkiv Solves This for Stealth Pay

Arkiv Network provides a unique combination of capabilities specifically tailored for decentralized payment applications:

### 1. Native Cryptographic Time-To-Live (TTL)
Payment requests should not live forever. An invoice for 100 USDT issued today should not be payable 2 years from now when price dynamics or business conditions have changed.
- Arkiv enables **native expirable entities** via TTL.
- Once a payment request expires, it is automatically pruned, preventing accidental payments to stale requests.

### 2. Queryable Decentralized Collections
Unlike raw IPFS CIDs, Arkiv entities can be indexed and queried by fields (e.g. `category == "Freelancer"`, `network == "Whitechain"`, `ownerAddress == "0x..."`).
- This allows Stealth Pay to offer a **Decentralized Merchant Directory** and **Identity Lookup** without maintaining an AWS/GCP indexing microservice.

### 3. Censorship Resistance with Low Latency
Arkiv consensus nodes guarantee data availability and tamper-proof storage with query latencies comparable to standard Web2 caching layers, providing a smooth user experience in Next.js web applications.
