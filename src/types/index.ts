export type TxType = 'sent' | 'received';
export type TxStatus = 'confirmed' | 'pending' | 'failed';

export type StealthPaymentStatus = 'GENERATED' | 'PENDING' | 'RECEIVED' | 'CLAIMED' | 'USED';

export interface OneTimeStealthAddressRecord {
  id: string;
  oneTimeAddress: string;          // Mathematically unique single-use EVM address
  ephemeralPublicKey: string;       // Sender ephemeral pubkey R = r*G
  stealthMetaAddress: string;       // Permanent, reusable receiver meta-address (st:eth:...)
  amount: number;
  asset: string;
  token?: string;
  network: string;
  status: StealthPaymentStatus;
  createdAt: string;
  claimedAt?: string;
  usedAt?: string;
  txHash?: string;
  nullifierHash?: string;
  memo?: string;
  isIncoming: boolean;              // True if incoming to our stealth identity
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  asset: string;
  token?: string;
  network: string;
  date: string;                     // ISO string
  status: TxStatus;
  counterparty: string;             // stealth address (shortened) or label
  message?: string;
  gasFee: number | string;
  oneTimeAddress?: string;          // Single-use destination address
  stealthRecipient?: string;
  paymentStatus?: StealthPaymentStatus;
  ephemeralPublicKey?: string;
}

export type NotificationKind = 'incoming' | 'confirmed' | 'failed';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  amount?: string;
  oneTimeAddress?: string;
}

export interface StealthIdentity {
  metaAddress: string;
  spendingKey: string;
  viewingKey: string;
  spendingPrivateKey?: string;
  viewingPrivateKey?: string;
  createdAt: string;
}

export interface WalletState {
  connected: boolean;
  provider: 'MetaMask' | 'WalletConnect' | null;
  address: string;
  network: string;
  balances: Record<string, number>;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  name: string;
  email: string;
  theme: ThemeMode;
  currency: string;
  twoFactor: boolean;
  notifyIncoming: boolean;
  notifyConfirmed: boolean;
  notifyFailed: boolean;
  notifyEmail: boolean;
}
