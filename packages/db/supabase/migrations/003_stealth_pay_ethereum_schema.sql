-- ─────────────────────────────────────────────────────────────────────────────
-- Stealth Pay — Phase 2 Database Migration
-- Migration: 003_stealth_pay_ethereum_schema.sql
--
-- Purpose : Add Ethereum-native stealth address tables required by the
--           Stealth Pay frontend (ERC-5564 / ERC-6538).
--           This is a purely ADDITIVE migration — it does NOT modify or
--           drop any tables created in migrations 001 or 002.
--
-- Networks: Sepolia testnet (chain_id 11155111) is the default.
-- Amounts : All ETH amounts are stored as numeric(38,0) in wei (never float).
-- Addresses: Stored as text; validation happens at the application boundary.
--
-- Pre-requisite: Migrations 001 and 002 must already be applied.
-- ─────────────────────────────────────────────────────────────────────────────

-- Guard: ensure previous migrations have been applied.
do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Missing table public.profiles. Apply 001_initial.sql first.';
  end if;
end;
$$;

-- ─── Shared updated_at trigger function (idempotent) ─────────────────────────
-- The function may already exist from migration 001; create or replace is safe.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- A. Extend profiles with display name and avatar
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists avatar_url   text;

-- Update the new-user trigger to initialise display_name from raw_user_meta_data
-- if present (e.g. OAuth providers supply it).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

-- Recreate trigger (drop first to avoid duplicate-trigger error on re-run).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- B. stealth_identities
--    Stores the PUBLIC stealth meta-address metadata for a receiver.
--    Sensitive spending key material is NEVER stored here.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.stealth_identities (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,

  -- ERC-5564 stealth meta-address (st:eth:0x<Pv><Ps>)
  meta_address     text        not null unique,

  -- ERC-5564 scheme identifier (1 = secp256k1 ECDH)
  scheme_id        integer     not null default 1,

  -- Network information
  chain_id         integer     not null default 11155111,  -- Sepolia
  network_name     text        not null default 'sepolia',

  -- Decomposed public keys (33-byte compressed, 0x-prefixed hex)
  -- Pv = public view key   (a·G)
  -- Ps = public spend key  (b·G)
  public_spend_key text        not null,
  public_view_key  text        not null,

  -- Lifecycle
  status           text        not null default 'active'
                               check (status in ('active', 'inactive', 'revoked')),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.stealth_identities enable row level security;

-- Owners can manage their own identities.
create policy "Users can read own stealth identities"
  on public.stealth_identities for select
  using (auth.uid() = user_id);

create policy "Users can insert own stealth identities"
  on public.stealth_identities for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stealth identities"
  on public.stealth_identities for update
  using (auth.uid() = user_id);

-- Public read of meta_address (senders need to look up receivers).
-- This policy allows any authenticated user to read the meta_address column only.
-- The application layer should not expose other columns through this path.
create policy "Public can read stealth meta_address"
  on public.stealth_identities for select
  using (status = 'active');

drop trigger if exists set_stealth_identities_updated_at on public.stealth_identities;
create trigger set_stealth_identities_updated_at
  before update on public.stealth_identities
  for each row execute procedure public.set_updated_at();

-- Indexes
create index if not exists stealth_identities_user_id_idx
  on public.stealth_identities (user_id);

create index if not exists stealth_identities_meta_address_idx
  on public.stealth_identities (meta_address);

create index if not exists stealth_identities_chain_id_status_idx
  on public.stealth_identities (chain_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- C. payments
--    Records each stealth payment lifecycle from preparation through claiming.
--    Distinct from the legacy `transactions` table (which is Bitcoin/BitGo-based).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id                    uuid        primary key default gen_random_uuid(),

  -- Sender may be anonymous (e.g. external wallet not registered in the system).
  sender_user_id        uuid        references auth.users(id) on delete set null,

  -- Receiver is identified through their stealth identity record.
  receiver_identity_id  uuid        not null references public.stealth_identities(id) on delete restrict,

  -- ERC-5564 derived fields
  stealth_address       text        not null,  -- A_stealth: one-time destination address
  ephemeral_public_key  text        not null,  -- R: 33-byte compressed hex

  -- Network
  chain_id              integer     not null default 11155111,

  -- Token information (NULL = native ETH)
  token_address         text,                  -- ERC-20 contract address, NULL for ETH
  token_symbol          text        not null default 'ETH',
  token_decimals        smallint    not null default 18,

  -- Amount in smallest unit (wei for ETH, or token's smallest unit).
  -- numeric(38,0) avoids floating-point precision loss for 256-bit integers.
  amount                numeric(38,0) not null check (amount > 0),

  -- Blockchain confirmation
  tx_hash               text        unique,    -- NULL until submitted on-chain
  block_number          bigint,
  block_timestamp       timestamptz,

  -- Payment lifecycle status
  -- prepared   → sender has built the tx but not yet submitted
  -- submitted  → tx broadcast to the network
  -- confirmed  → tx included in a block (≥1 confirmation)
  -- detected   → scanner has identified this as belonging to a receiver
  -- spendable  → receiver has recovered the spending key
  -- claimed    → receiver has swept funds to their own address
  -- failed     → tx reverted or permanently failed
  status                text        not null default 'prepared'
                                    check (status in (
                                      'prepared', 'submitted', 'confirmed',
                                      'detected', 'spendable', 'claimed', 'failed'
                                    )),

  -- Idempotency key set by the sender's client to prevent duplicate submissions.
  idempotency_key       text        unique,

  note                  text,

  created_at            timestamptz not null default now(),
  confirmed_at          timestamptz,
  claimed_at            timestamptz
);

alter table public.payments enable row level security;

-- Senders can read their own sent payments.
create policy "Senders can read own payments"
  on public.payments for select
  using (auth.uid() = sender_user_id);

-- Receivers can read payments sent to their stealth identities.
create policy "Receivers can read payments to their identities"
  on public.payments for select
  using (exists (
    select 1 from public.stealth_identities si
    where si.id = receiver_identity_id
      and si.user_id = auth.uid()
  ));

-- Authenticated users can prepare a payment (insert).
create policy "Authenticated users can prepare payments"
  on public.payments for insert
  with check (
    auth.uid() is not null
    and (sender_user_id is null or auth.uid() = sender_user_id)
  );

-- Status updates are managed by the backend / scanner (service role bypasses RLS).
-- This restrictive policy means only service role can update payment rows.
create policy "Service role updates payment status"
  on public.payments for update
  using (false);

-- Indexes
create index if not exists payments_sender_user_id_idx
  on public.payments (sender_user_id);

create index if not exists payments_receiver_identity_id_idx
  on public.payments (receiver_identity_id);

create index if not exists payments_tx_hash_idx
  on public.payments (tx_hash);

create index if not exists payments_stealth_address_idx
  on public.payments (stealth_address);

create index if not exists payments_status_chain_id_idx
  on public.payments (status, chain_id);

create index if not exists payments_created_at_idx
  on public.payments (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- D. notifications
--    Per-user notification inbox.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,

  type        text        not null check (type in (
                'payment_detected',
                'payment_confirmed',
                'payment_claimed',
                'system',
                'scanner_alert'
              )),

  title       text        not null,
  message     text        not null,
  is_read     boolean     not null default false,

  -- Flexible payload: may include payment_id, tx_hash, chain_id, etc.
  metadata    jsonb,

  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Service role inserts notifications (scanner, backend jobs).
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- Indexes
create index if not exists notifications_user_id_is_read_idx
  on public.notifications (user_id, is_read);

create index if not exists notifications_user_id_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_type_idx
  on public.notifications (type);

-- ─────────────────────────────────────────────────────────────────────────────
-- E. user_settings
--    One row per user; created automatically on first profile creation.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id                        uuid        primary key default gen_random_uuid(),
  user_id                   uuid        not null unique references auth.users(id) on delete cascade,

  -- Notification preferences
  notify_payment_detected   boolean     not null default true,
  notify_payment_confirmed  boolean     not null default true,
  notify_payment_claimed    boolean     not null default true,
  notify_system             boolean     not null default true,

  -- Application preferences
  default_chain_id          integer     not null default 11155111,
  default_token             text        not null default 'ETH',
  theme                     text        not null default 'dark'
                                        check (theme in ('light', 'dark', 'system')),

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_updated_at();

-- Index (user_id is already unique so implicitly indexed; kept for clarity).
create index if not exists user_settings_user_id_idx
  on public.user_settings (user_id);

-- Auto-create default settings when a new user signs up.
create or replace function public.handle_new_user_settings()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_settings on auth.users;
create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();

-- ─────────────────────────────────────────────────────────────────────────────
-- F. scanner_checkpoints
--    Global scanner state per (scanner_id, chain_id) pair.
--    Not user-owned — service role only.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scanner_checkpoints (
  id                       uuid        primary key default gen_random_uuid(),

  -- Identifies which scanner instance owns this checkpoint.
  -- Default 'default' works for a single-scanner deployment.
  scanner_id               text        not null default 'default',

  chain_id                 integer     not null default 11155111,

  -- Block progress
  last_processed_block     bigint      not null default 0,
  last_processed_log_index integer,
  last_processed_tx_hash   text,

  -- Health tracking
  is_healthy               boolean     not null default true,
  error_message            text,

  updated_at               timestamptz not null default now(),

  -- Each scanner owns exactly one checkpoint per chain.
  unique (scanner_id, chain_id)
);

alter table public.scanner_checkpoints enable row level security;

-- No user-level access — only the service role (which bypasses RLS) may read/write.
create policy "Deny all direct user access to scanner checkpoints"
  on public.scanner_checkpoints for all
  using (false);

drop trigger if exists set_scanner_checkpoints_updated_at on public.scanner_checkpoints;
create trigger set_scanner_checkpoints_updated_at
  before update on public.scanner_checkpoints
  for each row execute procedure public.set_updated_at();

-- Index
create index if not exists scanner_checkpoints_scanner_chain_idx
  on public.scanner_checkpoints (scanner_id, chain_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- G. Seed the default scanner checkpoint row (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.scanner_checkpoints (scanner_id, chain_id, last_processed_block)
values ('default', 11155111, 0)
on conflict (scanner_id, chain_id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- End of migration 003
-- ─────────────────────────────────────────────────────────────────────────────

