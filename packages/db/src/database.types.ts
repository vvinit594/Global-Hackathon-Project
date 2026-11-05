// ─────────────────────────────────────────────────────────────────────────────
// Stealth Pay — Supabase Database Types
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PaymentStatus =
  | 'prepared'
  | 'submitted'
  | 'confirmed'
  | 'detected'
  | 'spendable'
  | 'claimed'
  | 'failed';

export type StealthIdentityStatus = 'active' | 'inactive' | 'revoked';

export type NotificationType =
  | 'payment_detected'
  | 'payment_confirmed'
  | 'payment_claimed'
  | 'system'
  | 'scanner_alert';

export type Theme = 'light' | 'dark' | 'system';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      wallets: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          bitgo_wallet_id: string;
          network: string;
          encrypted_view_priv_key: string | null;
          encrypted_spend_priv_key: string | null;
          public_view_key: string | null;
          public_spend_key: string | null;
          wallet_id: string;
          coin: string;
          wallet_label: string;
          multisig_type: string | null;
          wallet_type: string | null;
          receive_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          bitgo_wallet_id: string;
          network?: string;
          encrypted_view_priv_key?: string | null;
          encrypted_spend_priv_key?: string | null;
          public_view_key?: string | null;
          public_spend_key?: string | null;
          wallet_id: string;
          coin: string;
          wallet_label: string;
          multisig_type?: string | null;
          wallet_type?: string | null;
          receive_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          bitgo_wallet_id?: string;
          network?: string;
          encrypted_view_priv_key?: string | null;
          encrypted_spend_priv_key?: string | null;
          public_view_key?: string | null;
          public_spend_key?: string | null;
          wallet_id?: string;
          coin?: string;
          wallet_label?: string;
          multisig_type?: string | null;
          wallet_type?: string | null;
          receive_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      stealth_identities: {
        Row: {
          id: string;
          user_id: string;
          meta_address: string;
          scheme_id: number;
          chain_id: number;
          network_name: string;
          public_spend_key: string;
          public_view_key: string;
          status: StealthIdentityStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meta_address: string;
          scheme_id?: number;
          chain_id?: number;
          network_name?: string;
          public_spend_key: string;
          public_view_key: string;
          status?: StealthIdentityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meta_address?: string;
          scheme_id?: number;
          chain_id?: number;
          network_name?: string;
          public_spend_key?: string;
          public_view_key?: string;
          status?: StealthIdentityStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      transactions: {
        Row: {
          id: string;
          wallet_id: string;
          tx_hash: string;
          direction: 'send' | 'receive';
          amount_sats: number;
          fee_sats: number;
          ephemeral_public_key: string | null;
          one_time_address: string | null;
          status: 'pending' | 'confirmed' | 'failed';
          note: string | null;
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          tx_hash: string;
          direction: 'send' | 'receive';
          amount_sats: number;
          fee_sats?: number;
          ephemeral_public_key?: string | null;
          one_time_address?: string | null;
          status?: 'pending' | 'confirmed' | 'failed';
          note?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          tx_hash?: string;
          direction?: 'send' | 'receive';
          amount_sats?: number;
          fee_sats?: number;
          ephemeral_public_key?: string | null;
          one_time_address?: string | null;
          status?: 'pending' | 'confirmed' | 'failed';
          note?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };

      payments: {
        Row: {
          id: string;
          sender_user_id: string | null;
          receiver_identity_id: string;
          stealth_address: string;
          ephemeral_public_key: string;
          chain_id: number;
          token_address: string | null;
          token_symbol: string;
          token_decimals: number;
          amount: string;
          tx_hash: string | null;
          block_number: number | null;
          block_timestamp: string | null;
          status: PaymentStatus;
          idempotency_key: string | null;
          note: string | null;
          created_at: string;
          confirmed_at: string | null;
          claimed_at: string | null;
        };
        Insert: {
          id?: string;
          sender_user_id?: string | null;
          receiver_identity_id: string;
          stealth_address: string;
          ephemeral_public_key: string;
          chain_id?: number;
          token_address?: string | null;
          token_symbol?: string;
          token_decimals?: number;
          amount: string;
          tx_hash?: string | null;
          block_number?: number | null;
          block_timestamp?: string | null;
          status?: PaymentStatus;
          idempotency_key?: string | null;
          note?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
          claimed_at?: string | null;
        };
        Update: {
          id?: string;
          sender_user_id?: string | null;
          receiver_identity_id?: string;
          stealth_address?: string;
          ephemeral_public_key?: string;
          chain_id?: number;
          token_address?: string | null;
          token_symbol?: string;
          token_decimals?: number;
          amount?: string;
          tx_hash?: string | null;
          block_number?: number | null;
          block_timestamp?: string | null;
          status?: PaymentStatus;
          idempotency_key?: string | null;
          note?: string | null;
          created_at?: string;
          confirmed_at?: string | null;
          claimed_at?: string | null;
        };
        Relationships: [];
      };

      detected_payments: {
        Row: {
          id: string;
          wallet_id: string;
          tx_hash: string;
          one_time_address: string;
          ephemeral_public_key: string;
          amount_sats: number;
          block_height: number | null;
          spent_tx_hash: string | null;
          spent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          tx_hash: string;
          one_time_address: string;
          ephemeral_public_key: string;
          amount_sats: number;
          block_height?: number | null;
          spent_tx_hash?: string | null;
          spent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          tx_hash?: string;
          one_time_address?: string;
          ephemeral_public_key?: string;
          amount_sats?: number;
          block_height?: number | null;
          spent_tx_hash?: string | null;
          spent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          message?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };

      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notify_payment_detected: boolean;
          notify_payment_confirmed: boolean;
          notify_payment_claimed: boolean;
          notify_system: boolean;
          default_chain_id: number;
          default_token: string;
          theme: Theme;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notify_payment_detected?: boolean;
          notify_payment_confirmed?: boolean;
          notify_payment_claimed?: boolean;
          notify_system?: boolean;
          default_chain_id?: number;
          default_token?: string;
          theme?: Theme;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notify_payment_detected?: boolean;
          notify_payment_confirmed?: boolean;
          notify_payment_claimed?: boolean;
          notify_system?: boolean;
          default_chain_id?: number;
          default_token?: string;
          theme?: Theme;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      scanner_checkpoints: {
        Row: {
          id: string;
          scanner_id: string;
          chain_id: number;
          last_processed_block: number;
          last_processed_log_index: number | null;
          last_processed_tx_hash: string | null;
          is_healthy: boolean;
          error_message: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scanner_id?: string;
          chain_id?: number;
          last_processed_block?: number;
          last_processed_log_index?: number | null;
          last_processed_tx_hash?: string | null;
          is_healthy?: boolean;
          error_message?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          scanner_id?: string;
          chain_id?: number;
          last_processed_block?: number;
          last_processed_log_index?: number | null;
          last_processed_tx_hash?: string | null;
          is_healthy?: boolean;
          error_message?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      scanner_state: {
        Row: {
          id: string;
          wallet_id: string;
          last_scanned_block: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          last_scanned_block?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          last_scanned_block?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type WalletInsert = Database['public']['Tables']['wallets']['Insert'];
export type WalletUpdate = Database['public']['Tables']['wallets']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type DetectedPayment = Database['public']['Tables']['detected_payments']['Row'];
export type DetectedPaymentInsert = Database['public']['Tables']['detected_payments']['Insert'];
export type DetectedPaymentUpdate = Database['public']['Tables']['detected_payments']['Update'];

export type ScannerState = Database['public']['Tables']['scanner_state']['Row'];
export type ScannerStateInsert = Database['public']['Tables']['scanner_state']['Insert'];
export type ScannerStateUpdate = Database['public']['Tables']['scanner_state']['Update'];

export type StealthIdentity = Database['public']['Tables']['stealth_identities']['Row'];
export type StealthIdentityInsert = Database['public']['Tables']['stealth_identities']['Insert'];
export type StealthIdentityUpdate = Database['public']['Tables']['stealth_identities']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

export type ScannerCheckpoint = Database['public']['Tables']['scanner_checkpoints']['Row'];
export type ScannerCheckpointInsert = Database['public']['Tables']['scanner_checkpoints']['Insert'];
export type ScannerCheckpointUpdate = Database['public']['Tables']['scanner_checkpoints']['Update'];
