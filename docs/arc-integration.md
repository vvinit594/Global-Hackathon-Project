# Arc by Circle Integration Architecture

## 1. Overview
**Arc** is Circle's next-generation stablecoin-native financial infrastructure. In Stealth Pay, Arc serves as our secondary cross-border settlement rail for institutional and high-volume USDC transactions.

---

## 2. Architectural Role in Stealth Pay

| Component | Role | Network Identifier |
|:---|:---|:---:|
| **Primary Retail Rail** | Whitechain Testnet (USDT / WBT) | Chain ID `2625` |
| **Cross-Border Institutional Rail** | Arc Testnet (Circle USDC) | Chain ID `5042` |

---

## 3. Key Benefits of Arc Integration

1. **Native USDC Gas Settlement:**
   - On Arc, gas fees can be paid directly in USDC or subsidized through Circle's paymaster infrastructure, eliminating the friction of acquiring native gas tokens.
2. **CCTP (Cross-Chain Transfer Protocol):**
   - Enables seamless teleports of USDC between Ethereum, Arbitrum, Base, and Arc without locking liquidity in centralized bridges.
3. **Regulatory-Grade Privacy Compatibility:**
   - Stealth addresses provide client-side unlinkability for business-to-business payroll without triggering protocol-level blacklists associated with anonymity mixers.
