# Stealth Pay — Architecture Specification

## 1. System Architecture Overview

Stealth Pay combines **EIP-5564 stealth addresses** with **Arkiv decentralized storage**, **Whitechain high-throughput execution**, **ENS identity resolution**, and **Uniswap v3 liquidity routing**.

```mermaid
flowchart TD
    subgraph Client["Web3 Client (Next.js + Wagmi + Viem)"]
        UI["Frontend UI (11 Pages)"]
        CryptoEngine["ERC-5564 Secp256k1 Cryptography Engine"]
        KeyStore["Local In-Memory Private Key Storage"]
    end

    subgraph DecentralizedData["Decentralized Storage Layer"]
        ArkivRegistry["Arkiv Identity Registry"]
        ArkivRequests["Arkiv Expiring Payment Requests (with TTL)"]
        ArkivDirectory["Arkiv Merchant / Freelancer Directory"]
    end

    subgraph Networks["Blockchain Execution Networks"]
        subgraph Whitechain["Whitechain Testnet (Chain ID 2625)"]
            Router["StealthPaymentRouter.sol"]
            Announcer["ERC5564Announcer.sol"]
            USDT["USDT / WBT Liquidity"]
        end
        subgraph EthereumSepolia["Ethereum Sepolia / Mainnet"]
            ENS["ENS Registry & Resolver (stealth-meta-address)"]
            UniV3["Uniswap v3 Quoter & Router"]
        end
        subgraph Arc["Arc by Circle (Chain ID 5042)"]
            ArcUSDC["Cross-Border Micro-Settlement (USDC)"]
        end
    end

    subgraph ScannerNode["Scanner Service"]
        BlockScanner["Multi-Chain Block Scanner"]
        SupabaseDB[("PostgreSQL / Supabase State")]
    end

    UI --> CryptoEngine
    CryptoEngine --> KeyStore
    UI <--> ArkivRegistry
    UI <--> ArkivRequests
    UI <--> ENS
    UI <--> UniV3

    CryptoEngine --> Router
    Router --> Announcer
    Router --> USDT

    BlockScanner --> Announcer
    BlockScanner --> SupabaseDB
```

---

## 2. Cryptographic Flow (ERC-5564)

### Receiver Setup
1. Receiver generates two private keypairs on secp256k1 curve:
   - **Spending Keypair:** $(b, P_s)$ where $P_s = b \cdot G$
   - **Viewing Keypair:** $(v, P_v)$ where $P_v = v \cdot G$
2. Receiver forms their permanent **Stealth Meta-Address**:
   $$\text{metaAddress} = \text{"st:eth:0x"} \parallel \text{hex}(P_s) \parallel \text{hex}(P_v)$$
   *(Total length: 141 characters)*
3. Receiver shares this meta-address publicly, publishes it to Arkiv, or binds it to their ENS name as a `stealth-meta-address` text record.

### Payment Execution (Sender)
```mermaid
sequenceDiagram
    autonumber
    actor Sender
    participant UI as Stealth Pay UI
    participant ENS as ENS Resolver
    participant Arkiv as Arkiv Network
    participant Chain as Whitechain (Chain 2625)
    participant Router as StealthPaymentRouter

    Sender->>UI: Enter recipient (vitalik.eth or req_123 or st:eth:...)
    alt ENS Domain
        UI->>ENS: Query text record 'stealth-meta-address'
        ENS-->>UI: Return st:eth:0x<Ps><Pv>
    else Arkiv Request
        UI->>Arkiv: Query payment request by ID
        Arkiv-->>UI: Return st:eth:0x<Ps><Pv> + Amount
    end

    UI->>UI: Generate ephemeral keypair (r, R = r * G)
    UI->>UI: Compute shared secret S = r * Pv
    UI->>UI: Compute hashed secret c = keccak256(S)
    UI->>UI: Derive stealth public key P_stealth = Ps + c * G
    UI->>UI: Derive one-time destination address A_stealth = address(P_stealth)

    Sender->>UI: Confirm payment
    UI->>Router: sendERC20Payment(token, A_stealth, amount, R, metadata)
    Router->>Chain: Transfer USDT to A_stealth
    Router->>Chain: Emit ERC5564 Announcement(A_stealth, R, metadata)
    Chain-->>Sender: Transaction Receipt
```

### Detection & Local Non-Custodial Sweep (Receiver)
```mermaid
sequenceDiagram
    autonumber
    actor Receiver
    participant UI as Stealth Pay In-Browser App
    participant Scanner as Scanner Service
    participant Chain as Whitechain Testnet

    Scanner->>Chain: Read Announcement events from ERC5564Announcer
    Scanner-->>UI: Detected payment with ephemeral pubkey R and A_stealth

    Receiver->>UI: Click 'Claim & Sweep Funds'
    Note over UI: In-memory non-custodial computation
    UI->>UI: Compute shared secret S = v * R
    UI->>UI: Compute c = keccak256(S)
    UI->>UI: Compute stealth private key p = (b + c) mod n
    UI->>UI: Verify address(p * G) == A_stealth

    UI->>Chain: Sign & broadcast sweep transaction using key p
    Chain-->>Receiver: Funds deposited to Receiver Primary Wallet
    Note over UI: Key p immediately cleared from memory
```

---

## 3. Arkiv Decentralized Data Layer Architecture

Arkiv is used to store state that must be decentralized, public, and verifiable without running proprietary backend servers:

1. **Identity Registry (`stealth_identities` collection):**
   - Stores user public profiles with their permanent stealth meta-address.
   - Senders can query identities by display name, category, or public wallet address.
2. **Expiring Payment Requests (`payment_requests` collection):**
   - Senders receive an expirable invoice containing the requested amount, token, network, memo, and recipient stealth meta-address.
   - Leverages Arkiv's time-to-live (TTL) feature to ensure stale or paid invoices automatically purge, avoiding payment errors.
3. **Merchant Directory (`merchant_directory` collection):**
   - Privacy-friendly merchant discovery allowing users to browse services accepting stealth payments.

---

## 4. Whitechain Smart Contract Integration

Whitechain provides low latency (sub-second block time) and low transaction fees, making frequent stealth payments and sweeps economical:

- **Network Name:** Whitechain Testnet
- **Chain ID:** `2625`
- **Native Gas Token:** `WBT` (18 decimals)
- **RPC URL:** `https://rpc-testnet.whitechain.io`
- **Explorer:** `https://testnet.whitechainsentry.com`

### Atomic Execution Architecture
In traditional implementations, payments to stealth addresses and ERC-5564 announcements happen in separate steps, which risks orphaned payments if the announcement fails. `StealthPaymentRouter.sol` ensures atomicity:
- Native WBT transfers: transfer and announcement execute in the same transaction call.
- ERC-20 transfers (USDT): token transfer via `transferFrom` and announcement execute atomically.

---

## 5. ENS & Uniswap v3 Architecture

- **ENS Integration:**
  - Viem client queries Ethereum Mainnet/Sepolia RPC.
  - Reads standard `stealth-meta-address` text record according to EIP-5564.
  - Fallback resolution supports address lookup and avatar resolution.
- **Uniswap v3 Integration:**
  - Before sending a stealth payment, senders can swap any held token (ETH, USDC, WBT) to the receiver's requested asset (USDT).
  - Quotes are calculated with 0.5% maximum slippage protection and displayed directly inside the payment review drawer.
