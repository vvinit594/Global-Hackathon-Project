# Stealth Pay – Frontend Prototype

Stealth Pay is a privacy-preserving blockchain payment platform prototype built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

This prototype demonstrates an end-to-end user experience for shielded EVM payments utilizing dual-key stealth addresses (EIP-5564) and client-side private note commitments.

---

## 🎨 Design System & Palette

The user interface follows a restrained, modern fintech visual language:

| Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Background** | `#FAFAF8` | Warm White application canvas |
| **Cards** | `#FFFFFF` | Pure White content panels & cards |
| **Primary Accent** | `#B8C8B2` | Soft Sage for primary CTAs and active states |
| **Secondary Accent** | `#E8DCCB` | Light Beige for accents and highlights |
| **Text** | `#343434` | Charcoal for readable typography |
| **Borders** | `#E8E8E5` | 1px Light Grey dividers & outlines |

- **Card Radius**: `14px` (`rounded-card`)
- **Button Radius**: `10px` (`rounded-btn`)
- **Typography**: Clean modern sans-serif with readable monospace balance counters.

---

## 🧭 Routes & Pages Implemented

All 12 required routes are fully implemented with interactive mock state:

1. **`/` – Landing Page**: Product explanation, problem vs. solution, cryptographic 3-step workflow, core features, zero-knowledge constraints, and developer documentation.
2. **`/login` – Login**: Email/password credentials, password visibility toggle, remember me, wallet connection shortcut.
3. **`/register` – Register**: Full name, email, password confirmation, terms acceptance, local key generation prompt.
4. **`/forgot-password` – Forgot Password**: Recovery email submission with animated confirmation.
5. **`/dashboard` – User Dashboard**: Shielded balance card, hide/show balance privacy toggle, quick actions (Send/Receive/Identity), summary stats, interactive Recharts payment volume chart, and recent transaction activity.
6. **`/identity` – My Stealth Identity**: Static stealth meta-address (`st:eth:...`), public spending key, public viewing key, live `qrcode.react` SVG preview, PNG QR code download, and active shielded notes breakdown.
7. **`/receive` – Receive Payment**: Network selector, token selector (ETH, USDC, USDT), amount input with quick presets, live generated payment URI, QR preview, and shareable link with copy buttons.
8. **`/send` – Send Payment**: Stealth meta-address receiver input, destination network selector, amount validation against pool balance, memo field, pre-flight gas calculation, confirmation modal with animated multi-step proof simulation, and confetti celebration on confirmation.
9. **`/transactions` – Transaction History**: Search by hash/ID/memo, sent/received/shielded/withdrawal filters, status filters, CSV export, and clickable transaction details modal.
10. **`/wallet` – Wallet Management**: Web3 EVM connection interface (MetaMask, WalletConnect, Coinbase), network switching, public address, public testnet balances, and architectural distinction explanation.
11. **`/notifications` – Notifications**: Live payment discovery alerts, transaction confirmations, unread badge counters, filter by category, mark-as-read, and delete actions.
12. **`/settings` – Settings**: Profile information, 2FA security toggle, encrypted key backup export, network preferences, automatic note scanner switch, and fiat valuation currency selector.

---

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand
- **QR Code**: `qrcode.react`
- **Celebration Effects**: `canvas-confetti`

---

## 🔌 Backend Integration Boundary

The frontend is architected to decouple presentation from future services:
- **State Store (`src/store/index.ts`)**: Encapsulates all mock data mutations and note scanning logic. When the Java Spring Boot backend is introduced, the store actions can seamlessly dispatch REST or WebSocket calls.
- **Data Schemas (`src/types/index.ts`)**: Cleanly typed domain models for transactions, shielded notes, identities, and network configurations.
- **Client-Side Privacy**: Note decryption and scanning happen locally in the browser to ensure the backend never functions as a custodian of private viewing or spending secrets.

---

## 🚀 Running the Project

```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start
```
