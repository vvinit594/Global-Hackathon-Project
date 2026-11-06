# Stealth Pay — Security Specification & Threat Model

## 1. Security Philosophy & Scope

Stealth Pay provides **address unlinkability** for cryptocurrency transactions by leveraging the ERC-5564 standard. 

> [!IMPORTANT]
> **Honest Privacy Disclosure:** Stealth Pay is a privacy-preserving payment platform that prevents the direct link between a receiver's public identity and individual payment destinations. It does **not** provide complete anonymity, transaction graph erasure, or mixer-like obfuscation. On-chain amounts, timestamps, and network-level metadata remain publicly visible on the underlying blockchain.

---

## 2. Key Hierarchy & Non-Custodial Invariants

Stealth Pay enforces strict cryptographic separation between viewing capabilities and spending capabilities:

```
                      +-----------------------------+
                      |   Master Identity Secrets   |
                      +-----------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
    [Viewing Capability]                         [Spending Capability]
    - Viewing Private Key (v)                    - Spending Private Key (b)
    - Viewing Public Key (Pv)                    - Spending Public Key (Ps)
               |                                           |
               v                                           v
    Can scan Announcements                      REQUIRED to transfer funds
    Can detect incoming funds                   NEVER leaves browser memory
    CANNOT spend or sweep funds                 NEVER sent to scanner or server
```

### Invariant 1: Local Spending Key Custody
The spending private key ($b$) is **never** sent to any backend API, scanner service, or database. When sweeping funds from a one-time stealth address ($A_{stealth}$):
1. The ephemeral public key ($R$) is retrieved from the ERC-5564 announcement event.
2. The browser generates the shared secret $S = v \cdot R$ and scalar $c = \text{keccak256}(S)$.
3. The derived one-time private key $p = (b + c) \pmod n$ is computed directly in JavaScript/WASM memory.
4. The sweep transaction is signed locally by $p$.
5. All references to $p$ and $b$ are cleared from scope immediately after broadcast.

### Invariant 2: Scanner Separation of Privilege
The background scanner only needs viewing capability ($P_v$ or $v$) to identify matching transactions:
- It can compute $S = v \cdot R$ to test whether $A_{stealth} = \text{address}(P_s + \text{keccak256}(S) \cdot G)$.
- Even a compromised scanner node cannot generate $p$ without spending key $b$, preventing theft of detected funds.

---

## 3. Threat Modeling & Mitigations

### Threat A: Address Linkability / Address Clustering
- **Risk:** An adversary monitors a merchant's published address and links all customer transactions to that identity.
- **Mitigation:** Senders generate a fresh, cryptographically independent one-time address ($A_{stealth}$) for every payment using ephemeral key $r$. Outside observers cannot link multiple stealth addresses to the same recipient without solving the Elliptic Curve Discrete Logarithm Problem (ECDLP).

### Threat B: Scanner Denial of Service (DoS)
- **Risk:** High volume of announcement events forces the scanner to perform computationally expensive elliptic curve scalar multiplications ($v \cdot R$) for every block.
- **Mitigation:** EIP-5564 View Tags. The first byte of the shared secret hash ($\text{keccak256}(S)[0]$) is attached to the announcement metadata. The scanner performs a fast 1-byte comparison (99.6% rejection rate) before executing full EC point operations.

### Threat C: Atomicity Failure / Orphaned Payments
- **Risk:** A sender transfers funds directly to a stealth address but fails to emit the ERC-5564 announcement (or vice versa), making funds unrecoverable by the receiver.
- **Mitigation:** Atomic routing via `StealthPaymentRouter.sol`. The token transfer and announcement emission happen within the exact same EVM transaction. If either operation reverts, the entire transaction reverts.

### Threat D: Timing & Amount Correlation
- **Risk:** If Alice pays Bob exactly \$42.19 at 14:03:00, an adversary observing the Arkiv payment request can correlate the on-chain transfer.
- **Mitigation:** 
  - Arkiv payment requests support short time-to-live (TTL) expiry.
  - Senders can utilize Uniswap v3 pre-payment swapping to convert irregular token amounts into standard denominations before executing stealth settlement.

---

## 4. Smart Contract Security

The `StealthPaymentRouter.sol` contract incorporates standard defensive patterns:
1. **Reentrancy Protection:** All external transfer functions use OpenZeppelin-style reentrancy guards (`_locked` mutex flag).
2. **Safe ERC-20 Transfers:** Uses low-level call verification to support both standard ERC-20 tokens and non-standard tokens (like USDT on certain EVM chains that do not return a boolean).
3. **No Contract Custody:** The router never holds custody of funds; all transfers go directly to the derived stealth address (`recipient`).
