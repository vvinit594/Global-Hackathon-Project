# Stealth Pay — Database Security & RLS Policy Matrix

> Phase 2 deliverable detailing Row Level Security (RLS) policies, key custody boundaries, and data access permissions.

## 1. Key Storage & Custody Rules

1. **Private Spending Keys ($b$)**: **NEVER** stored in any database table. Generated and managed client-side in non-custodial wallets.
2. **Private Viewing Keys ($a$)**: Kept client-side. The backend only stores `public_view_key` ($A = a \cdot G$) and `public_spend_key` ($B = b \cdot G$) in `stealth_identities`.
3. **Passwords & Auth Credentials**: Managed strictly by Supabase Auth (`auth.users`).

## 2. Row Level Security (RLS) Policy Matrix

| Table | Operation | Policy / Condition | Actor |
|---|---|---|---|
| `profiles` | SELECT | `auth.uid() = id` | Owning User |
| `profiles` | UPDATE | `auth.uid() = id` | Owning User |
| `stealth_identities` | SELECT (own) | `auth.uid() = user_id` | Owning User |
| `stealth_identities` | SELECT (public) | `status = 'active'` (meta-address lookup) | Authenticated Users |
| `stealth_identities` | INSERT / UPDATE | `auth.uid() = user_id` | Owning User |
| `payments` | SELECT (sender) | `auth.uid() = sender_user_id` | Sender |
| `payments` | SELECT (receiver) | `EXISTS (SELECT 1 FROM stealth_identities si WHERE si.id = receiver_identity_id AND si.user_id = auth.uid())` | Receiver |
| `payments` | INSERT | `auth.uid() IS NOT NULL` | Sender / Authenticated |
| `payments` | UPDATE | `USING (false)` (bypassed only via Service Role) | Scanner / Worker |
| `notifications` | SELECT / UPDATE / DELETE | `auth.uid() = user_id` | Owning User |
| `notifications` | INSERT | Service Role (`CHECK (true)`) | Background Worker |
| `user_settings` | SELECT / INSERT / UPDATE | `auth.uid() = user_id` | Owning User |
| `scanner_checkpoints` | ALL | `USING (false)` (Service Role only) | Scanner Service |
