import type { AppNotification } from '@/types'

export const mockNotifications: AppNotification[] = [
  { id: 'n1', kind: 'incoming', title: 'Incoming payment detected', body: 'Demo: 250 USDC arrived at a one-time stealth address on Ethereum.', date: '2026-11-05T09:14:00Z', read: false },
  { id: 'n2', kind: 'confirmed', title: 'Transaction confirmed', body: 'Demo: Your payment of 0.45 ETH (DEMO-TX-1041) was confirmed.', date: '2026-11-04T16:48:00Z', read: false },
  { id: 'n3', kind: 'failed', title: 'Transaction failed', body: 'Demo: Payment of 75 USDC on Optimism (DEMO-TX-1038) did not complete.', date: '2026-11-03T08:55:00Z', read: false },
  { id: 'n4', kind: 'incoming', title: 'Incoming payment detected', body: 'Demo: 1.2 ETH arrived at a one-time stealth address on Arbitrum.', date: '2026-11-02T19:22:00Z', read: true },
  { id: 'n5', kind: 'confirmed', title: 'Transaction confirmed', body: 'Demo: Your payment of 0.1 ETH (DEMO-TX-1035) was confirmed.', date: '2026-10-28T21:25:00Z', read: true },
]
