# Uniswap v3 Pre-Payment Swap Integration

## 1. Overview
In global commerce, senders frequently hold assets (such as ETH, WBT, or USDC) that differ from what the receiver's invoice specifies (typically USDT). 

Instead of forcing senders to manually visit an external decentralized exchange, swap tokens, return to Stealth Pay, and then pay, Stealth Pay embeds **Uniswap v3 pre-payment swapping** directly into the payment flow.

---

## 2. Swap Architecture & Flow

```mermaid
sequenceDiagram
    autonumber
    actor Sender
    participant UI as Stealth Pay Send Flow
    participant API as /api/v1/swap/quote
    participant Quoter as Uniswap v3 Quoter Contract
    participant Router as SwapRouter02
    participant StealthRouter as StealthPaymentRouter

    Sender->>UI: Selects 'Pay with ETH' for '100 USDT' invoice
    UI->>API: GET /swap/quote?tokenIn=ETH&tokenOut=USDT&amountIn=0.035
    API->>Quoter: quoteExactInputSingle(tokenIn, tokenOut, fee=3000, amountIn)
    Quoter-->>API: Expected amountOut = 101.50 USDT
    API-->>UI: Quote preview + 0.5% max slippage

    Sender->>UI: Clicks 'Review & Confirm'
    UI->>Router: exactInputSingle(recipient = StealthPaymentRouter)
    Router->>StealthRouter: Swap output USDT delivered
    StealthRouter->>StealthRouter: Transfer USDT to one-time stealth address & emit Announcement
```

---

## 3. Slippage & Security Protections
- **Protected Slippage:** The client enforces a strict `0.5%` slippage tolerance. If price volatility exceeds this threshold, the transaction safely reverts.
- **Deadline Guard:** Swaps include a 20-minute execution deadline preventing transactions from getting stuck in the mempool.
