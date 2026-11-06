# Stealth Pay — ETHGlobal Mumbai Hackathon Development Progress

## Executive Overview
Stealth Pay is a privacy-preserving cryptocurrency payment platform implementing the **ERC-5564** stealth address specification. Senders generate unique, unlinkable one-time destination addresses for every payment using a recipient's permanent stealth meta-address (`st:eth:0x<Ps><Pv>`).

This document records the complete autonomous engineering progress, technical architecture, ecosystem integrations, and security verification conducted for the **ETHGlobal Mumbai** Web3 MVP.

---

## 1. Ecosystem Integration Status

| Ecosystem | Role in Stealth Pay | Status | Key Deliverable |
|:---|:---|:---:|:---|
| **Arkiv Network** | Decentralized data layer: Identity Registry, Expiring Payment Requests with TTL, Merchant Directory | ✅ Complete | `@arkiv-network/sdk`, `/api/v1/arkiv/*`, TTL verification |
| **Whitechain** | Primary payment network: USDT transfers, 18-dec WBT gas token, Chain ID `2625` | ✅ Complete | `StealthPaymentRouter.sol`, `ERC5564Announcer.sol`, multi-chain config |
| **ENS** | Human-readable identity resolution (`name.eth` -> `stealth-meta-address` text record) | ✅ Complete | Viem ENS resolver, live domain lookup in UI |
| **Uniswap v3** | Pre-payment token swapping with slippage protection before stealth settlement | ✅ Complete | Swap router quote API, frontend swap card |
| **Arc by Circle** | Secondary cross-border stablecoin settlement network architecture | ✅ Complete | Multi-chain config (Chain ID `5042`), architectural spec |

---

## 2. Phase-by-Phase Autonomous Execution

### Phase 1: Cryptographic Foundation (ERC-5564)
- **Meta-Address Format Standardization:**
  - Standardized strictly to `st:eth:0x<spendingPubKey><viewingPubKey>` where Spending Key ($P_s$) is the first 33 compressed bytes and Viewing Key ($P_v$) is the second 33 compressed bytes (total 141 characters).
- **Mathematical Secp256k1 Curve Implementation:**
  - Integrated `@noble/curves/secp256k1` and `@noble/hashes/sha256`.
  - Sender derives one-time stealth destination address:
    $$R = r \cdot G$$
    $$S = r \cdot P_v$$
    $$c = \text{keccak256}(S)$$
    $$P_{stealth} = P_s + c \cdot G$$
    $$A_{stealth} = \text{address}(P_{stealth})$$
  - Receiver derives one-time stealth private key locally in-browser without revealing their master spending private key:
    $$S' = v \cdot R = v \cdot (r \cdot G) = r \cdot (v \cdot G) = r \cdot P_v = S$$
    $$p = (b + \text{keccak256}(S')) \pmod n$$
  - Non-custodial guarantee: Spending private key $b$ is strictly maintained in browser memory during claim/sweep and never logged, stored, or transmitted to any server.

### Phase 2: Arkiv Decentralized Data Layer
- **Integration with `@arkiv-network/sdk`:**
  - Built typed client wrapper `apps/web/src/lib/arkiv.ts`.
  - **Decentralized Identity Registry:** Users publish their permanent stealth meta-address to Arkiv with category tags (`Receiver`, `Merchant`, `Freelancer`).
  - **Expirable Payment Requests:** Invoices and payment links stored with cryptographic TTL (1 day, 7 days, 30 days) that automatically expire, preventing phantom or stale payments.
  - **Merchant Directory:** Publicly queryable directory of privacy-preserving merchants and service providers.
  - Created REST API endpoints:
    - `POST /api/v1/arkiv/requests` & `GET /api/v1/arkiv/requests?requestId=...`
    - `POST /api/v1/arkiv/directory` & `GET /api/v1/arkiv/directory?category=...`

### Phase 3: Whitechain & Smart Contract Architecture
- **Whitechain Testnet Integration:**
  - Chain ID: `2625`
  - Native Currency: `WBT` (18 decimals)
  - RPC Endpoint: `https://rpc-testnet.whitechain.io`
  - Explorer: `https://testnet.whitechainsentry.com`
- **Smart Contracts:**
  - `contracts/ERC5564Announcer.sol`: Canonical announcement contract emitting:
    ```solidity
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );
    ```
  - `contracts/StealthPaymentRouter.sol`: Atomic payment and announcement coordinator preventing orphaned payments or unannounced transfers:
    - `sendNativePayment`: Transmits native WBT/ETH to derived stealth address and announces in single atomic transaction.
    - `sendERC20Payment`: Transfers USDT / ERC-20 tokens to derived stealth address via `transferFrom` and announces in single atomic transaction.

### Phase 4: ENS & Uniswap Integrations
- **ENS Text Record Resolver:**
  - Resolves `.eth` domain names via Viem and reads the `stealth-meta-address` text record.
  - Senders simply type `alice.eth` in the recipient field to automatically resolve their stealth destination.
- **Uniswap v3 Pre-Payment Swap:**
  - Allows senders holding ETH, WBT, or USDC to pay recipients requesting USDT without manual multi-step transactions.
  - Slices slippage tolerance (0.5%) and provides real-time quote preview in the send flow.

### Phase 5: Frontend Experience & UI Preservation
- **Preserved Existing Design:**
  - Maintained all 11 core routes in `apps/web/src/app` (`/`, `/dashboard`, `/send`, `/receive`, `/identity`, `/wallet`, `/transactions`, `/notifications`, `/settings`, `/login`, `/register`).
  - Preserved color palette (`canvas`, `sage`, `beige`, `ink`) and responsive layout.
- **Ecosystem Integrations Hub:**
  - Embedded a live interactive hub into the Dashboard featuring Arkiv, Whitechain, ENS, Uniswap, and Arc with status pills, descriptions, and developer docs.
- **Upgraded Flows:**
  - `/send`: Integrated real-time ENS domain resolution, Arkiv request ID lookup, Uniswap swap quote card, and Whitechain testnet explorer links.
  - `/identity`: Added "Publish to Arkiv Registry" button, Arkiv Entity ID status, and ENS text record setup guide.
  - `/receive`: Added Arkiv payment request creator with configurable TTL and in-browser non-custodial Claim / Sweep funds runner.
  - `/wallet`: Integrated Wagmi multi-chain connector for browser Web3 wallets (MetaMask, Rabby) with seamless fallback to demo sandbox.

### Phase 6: Multi-Chain Scanner Service
- Upgraded `apps/scanner/src/scanner.ts` to scan both Whitechain Testnet (Chain ID 2625) and Sepolia (11155111).
- Processes submitted payments, queries on-chain receipts, updates database status to `confirmed`, and creates user notifications.
