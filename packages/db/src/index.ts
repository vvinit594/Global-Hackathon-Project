// ─────────────────────────────────────────────────────────────────────────────
// @stealth/db — public package exports
// ─────────────────────────────────────────────────────────────────────────────

// Supabase client factories
export {
  createSupabaseClient,
  getSupabaseClient,
  getSupabaseAdmin,
} from './client';

// Database interface and all table types
export type {
  // Core type
  Database,
  Json,

  // Value union types
  PaymentStatus,
  StealthIdentityStatus,
  NotificationType,
  Theme,

  // Migration 001 / 002 — legacy Bitcoin/BitGo tables
  Profile,
  ProfileInsert,
  ProfileUpdate,

  Wallet,
  WalletInsert,
  WalletUpdate,

  Transaction,
  TransactionInsert,
  TransactionUpdate,

  DetectedPayment,
  DetectedPaymentInsert,
  DetectedPaymentUpdate,

  ScannerState,
  ScannerStateInsert,
  ScannerStateUpdate,

  // Migration 003 — Ethereum stealth address tables
  StealthIdentity,
  StealthIdentityInsert,
  StealthIdentityUpdate,

  Payment,
  PaymentInsert,
  PaymentUpdate,

  Notification,
  NotificationInsert,
  NotificationUpdate,

  UserSettings,
  UserSettingsInsert,
  UserSettingsUpdate,

  ScannerCheckpoint,
  ScannerCheckpointInsert,
  ScannerCheckpointUpdate,
} from './database.types';
