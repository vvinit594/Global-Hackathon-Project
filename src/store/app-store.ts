import { create } from 'zustand'
import type { AppNotification, Settings, StealthIdentity, Transaction, WalletState, OneTimeStealthAddressRecord, StealthPaymentStatus } from '@/types'
import { mockTransactions } from '@/data/mock-transactions'
import { mockNotifications } from '@/data/mock-notifications'
import { demoWallet } from '@/data/mock-wallet'
import { MOCK_STEALTH_RECORDS } from '@/data/mock-stealth-records'
import { deriveOneTimeStealthAddress } from '@/utils/stealth'

interface Toast {
  id: number
  message: string
  tone: 'success' | 'error' | 'info'
}

interface AppState {
  authed: boolean
  login: () => void
  logout: () => void
  identity: StealthIdentity | null
  setIdentity: (i: StealthIdentity | null) => void
  wallet: WalletState
  connectWallet: (p: 'MetaMask' | 'WalletConnect') => void
  disconnectWallet: () => void
  setNetwork: (n: string) => void
  transactions: Transaction[]
  addTransaction: (t: Transaction) => void
  notifications: AppNotification[]
  markRead: (id: string) => void
  markAllRead: () => void
  deleteNotification: (id: string) => void
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
  toasts: Toast[]
  toast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void

  // One-time stealth address records
  stealthRecords: OneTimeStealthAddressRecord[]
  createOneTimeStealthPayment: (params: {
    receiverMetaAddress: string
    amount: number
    asset: string
    network: string
    memo?: string
  }) => { record: OneTimeStealthAddressRecord; tx: Transaction }
  claimStealthPayment: (recordId: string) => void
  markAddressAsUsed: (recordId: string) => void
  simulateIncomingStealthPayment: (customAmount?: number) => OneTimeStealthAddressRecord
}

let toastId = 0

const INITIAL_DEMO_IDENTITY: StealthIdentity = {
  metaAddress: 'st:eth:0x028c9fe47b9938dcb90184bba01948bc891048bce910283749bcf819028374900a',
  spendingKey: '0x02e48bce9019283749bcf8190283749bcf910283749bdf8192837491029384910a',
  viewingKey: '0x03d7c54b2990f11ac891029384918293849102938491293849102938491029384b',
  createdAt: '2026-11-01T12:00:00Z',
}

export const useAppStore = create<AppState>((set, get) => ({
  authed: true,
  login: () => set({ authed: true }),
  logout: () => set({ authed: false }),
  identity: INITIAL_DEMO_IDENTITY,
  setIdentity: (identity) => set({ identity }),
  wallet: demoWallet,
  connectWallet: (provider) => set({ wallet: { ...demoWallet, connected: true, provider } }),
  disconnectWallet: () => set((s) => ({ wallet: { ...s.wallet, connected: false, provider: null } })),
  setNetwork: (network) => set((s) => ({ wallet: { ...s.wallet, network } })),
  transactions: mockTransactions,
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  notifications: mockNotifications,
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  deleteNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  settings: {
    name: 'Amara Okafor',
    email: 'amara@example.com',
    theme: 'light',
    currency: 'USD',
    twoFactor: false,
    notifyIncoming: true,
    notifyConfirmed: true,
    notifyFailed: true,
    notifyEmail: false,
  },
  updateSettings: (s) => {
    set((st) => ({ settings: { ...st.settings, ...s } }))
    if (s.theme && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', s.theme === 'dark')
    }
  },
  toasts: [],
  toast: (message, tone = 'success') => {
    const id = ++toastId
    set({ toasts: [...get().toasts, { id, message, tone }] })
    setTimeout(() => get().dismissToast(id), 3200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // One-Time Stealth Records Management
  stealthRecords: MOCK_STEALTH_RECORDS,

  createOneTimeStealthPayment: ({ receiverMetaAddress, amount, asset, network, memo }) => {
    const derived = deriveOneTimeStealthAddress(receiverMetaAddress)
    const recordId = `stealth-rec-${Date.now()}`
    const txId = `DEMO-TX-${Math.floor(1000 + Math.random() * 9000)}`

    const newRecord: OneTimeStealthAddressRecord = {
      id: recordId,
      oneTimeAddress: derived.oneTimeAddress,
      ephemeralPublicKey: derived.ephemeralPublicKey,
      stealthMetaAddress: receiverMetaAddress,
      amount,
      asset,
      network,
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
      txHash: derived.sharedSecretHash,
      nullifierHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      memo,
      isIncoming: false,
    }

    const newTx: Transaction = {
      id: txId,
      type: 'sent',
      amount,
      asset,
      network,
      date: new Date().toISOString(),
      status: 'confirmed',
      paymentStatus: 'RECEIVED',
      oneTimeAddress: derived.oneTimeAddress,
      stealthRecipient: receiverMetaAddress,
      counterparty: `${derived.oneTimeAddress.slice(0, 6)}…${derived.oneTimeAddress.slice(-4)} (One-Time)`,
      message: memo,
      gasFee: 0.0012,
    }

    set((state) => {
      const curBal = state.wallet.balances[asset] ?? 0
      return {
        stealthRecords: [newRecord, ...state.stealthRecords],
        transactions: [newTx, ...state.transactions],
        wallet: {
          ...state.wallet,
          balances: {
            ...state.wallet.balances,
            [asset]: Math.max(0, curBal - amount),
          },
        },
      }
    })

    get().toast(`Sent ${amount} ${asset} to one-time stealth address!`, 'success')

    return { record: newRecord, tx: newTx }
  },

  claimStealthPayment: (recordId: string) => {
    const target = get().stealthRecords.find((r) => r.id === recordId)
    if (!target) return

    set((state) => {
      const curBal = state.wallet.balances[target.asset] ?? 0
      return {
        stealthRecords: state.stealthRecords.map((r) =>
          r.id === recordId
            ? { ...r, status: 'CLAIMED' as StealthPaymentStatus, claimedAt: new Date().toISOString() }
            : r
        ),
        transactions: state.transactions.map((t) =>
          t.oneTimeAddress === target.oneTimeAddress ? { ...t, paymentStatus: 'CLAIMED' } : t
        ),
        wallet: {
          ...state.wallet,
          balances: {
            ...state.wallet.balances,
            [target.asset]: curBal + target.amount,
          },
        },
      }
    })

    get().toast(`Claimed +${target.amount} ${target.asset} from one-time address into balance!`, 'success')
  },

  markAddressAsUsed: (recordId: string) => {
    const target = get().stealthRecords.find((r) => r.id === recordId)
    if (!target) return

    set((state) => ({
      stealthRecords: state.stealthRecords.map((r) =>
        r.id === recordId
          ? { ...r, status: 'USED' as StealthPaymentStatus, usedAt: new Date().toISOString() }
          : r
      ),
      transactions: state.transactions.map((t) =>
        t.oneTimeAddress === target.oneTimeAddress ? { ...t, paymentStatus: 'USED' } : t
      ),
    }))

    get().toast(`Address ${target.oneTimeAddress.slice(0, 10)}… retired to USED state. Retained for audit.`, 'info')
  },

  simulateIncomingStealthPayment: (customAmount?: number) => {
    const currentMeta = get().identity?.metaAddress || INITIAL_DEMO_IDENTITY.metaAddress
    const derived = deriveOneTimeStealthAddress(currentMeta)
    const amount = customAmount || 250
    const asset = 'USDC'
    const network = 'Ethereum'
    const recordId = `stealth-in-${Date.now()}`
    const txId = `DEMO-TX-${Math.floor(1000 + Math.random() * 9000)}`

    const newRecord: OneTimeStealthAddressRecord = {
      id: recordId,
      oneTimeAddress: derived.oneTimeAddress,
      ephemeralPublicKey: derived.ephemeralPublicKey,
      stealthMetaAddress: currentMeta,
      amount,
      asset,
      network,
      status: 'RECEIVED',
      createdAt: new Date().toISOString(),
      txHash: derived.sharedSecretHash,
      nullifierHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      memo: 'Simulated payment from client',
      isIncoming: true,
    }

    const newTx: Transaction = {
      id: txId,
      type: 'received',
      amount,
      asset,
      network,
      date: new Date().toISOString(),
      status: 'confirmed',
      paymentStatus: 'RECEIVED',
      oneTimeAddress: derived.oneTimeAddress,
      stealthRecipient: currentMeta,
      counterparty: `${derived.oneTimeAddress.slice(0, 6)}…${derived.oneTimeAddress.slice(-4)} (One-Time)`,
      message: 'Client consulting fee',
      gasFee: 0,
    }

    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      kind: 'incoming',
      title: 'Incoming payment detected',
      body: `Demo: ${amount} ${asset} arrived on fresh one-time address ${derived.oneTimeAddress.slice(0, 8)}…`,
      date: new Date().toISOString(),
      read: false,
      amount: `+${amount} ${asset}`,
      oneTimeAddress: derived.oneTimeAddress,
    }

    set((state) => ({
      stealthRecords: [newRecord, ...state.stealthRecords],
      transactions: [newTx, ...state.transactions],
      notifications: [newNotif, ...state.notifications],
    }))

    get().toast(`Detected +${amount} ${asset} at unique one-time stealth address!`, 'success')

    return newRecord
  },
}))
