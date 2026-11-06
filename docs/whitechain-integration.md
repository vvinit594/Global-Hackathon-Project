# Whitechain Testnet Integration Guide

## 1. Overview
Stealth Pay has selected **Whitechain** as its primary settlement blockchain due to its EVM compatibility, sub-second transaction finality, and ultra-low transaction costs, making regular stealth payments and receiver fund sweeps economical.

---

## 2. Network Configuration

| Parameter | Value |
|:---|:---|
| **Network Name** | Whitechain Testnet |
| **Chain ID** | `2625` (Hex: `0xa41`) |
| **Native Currency** | WhiteBIT Token (`WBT`) |
| **Decimals** | 18 |
| **RPC Endpoint** | `https://rpc-testnet.whitechain.io` |
| **Block Explorer** | `https://testnet.whitechainsentry.com` |

---

## 3. Supported Assets on Whitechain
- **Native WBT:** Used for network gas fees and direct stealth payments.
- **USDT (Tether USD):** Primary stablecoin used for merchant payments, payroll, and invoicing.

---

## 4. Smart Contract Architecture

Stealth Pay deploys two dedicated contracts to Whitechain Testnet:

### A. `contracts/ERC5564Announcer.sol`
Standard EIP-5564 announcement contract that emits:
```solidity
event Announcement(
    uint256 indexed schemeId,
    address indexed stealthAddress,
    address indexed caller,
    bytes ephemeralPubKey,
    bytes metadata
);
```

### B. `contracts/StealthPaymentRouter.sol`
Atomic router combining payment settlement and announcement emission in a single transaction call to prevent payment orphan errors.
- `sendNativePayment(...)`: Transfers native WBT and announces atomically.
- `sendERC20Payment(...)`: Calls `transferFrom` on USDT and announces atomically.
