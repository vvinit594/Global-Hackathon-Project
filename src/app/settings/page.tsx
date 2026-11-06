"use client"

import { useState } from 'react'
import Link from 'next/link'
import {
  Smartphone,
  Laptop,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  Wallet,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Field, Input, Select, Toggle } from '@/components/ui'
import { PageHeader, DemoNotice } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/utils/format'
import type { ThemeMode } from '@/types'

const tabs = [
  ['profile', 'Profile'],
  ['security', 'Security'],
  ['wallet', 'Wallet'],
  ['preferences', 'Preferences'],
  ['about', 'About'],
] as const
type Tab = (typeof tabs)[number][0]

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
})
const pwSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    next: z.string().min(8, 'New password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  const { settings, updateSettings, wallet, toast } = useAppStore()
  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: settings.name, email: settings.email },
  })
  const pw = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) })

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage identity profile, cryptographic security, and interface parameters."
        />

        <DemoNotice />

        {/* HORIZONTAL TABS */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border sm:border-none">
          {tabs.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                'shrink-0 cursor-pointer rounded-control px-4 py-2 font-mono text-xs font-medium transition-colors border',
                tab === k
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border bg-surface text-muted hover:text-foreground hover:bg-surface-secondary'
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE TAB */}
        {tab === 'profile' && (
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-base font-semibold text-foreground tracking-tight mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8 items-start">
              {/* Profile Inputs */}
              <form
                className="space-y-4"
                onSubmit={profile.handleSubmit((v) => {
                  updateSettings(v)
                  toast('Profile saved successfully')
                })}
              >
                <Field label="Full Name" error={profile.formState.errors.name?.message}>
                  <Input placeholder="Subham Tiwari" {...profile.register('name')} />
                </Field>
                <Field label="Email Address" error={profile.formState.errors.email?.message}>
                  <Input
                    type="email"
                    placeholder="subham@stealthpay.io"
                    {...profile.register('email')}
                  />
                </Field>
                <Button
                  type="submit"
                  className="mt-2 h-10 px-6 font-medium text-xs"
                  loading={profile.formState.isSubmitting}
                >
                  Update Profile
                </Button>
              </form>

              {/* Avatar Section on Right */}
              <div className="flex flex-col items-center justify-center p-6 rounded-card border border-border bg-surface-secondary text-center">
                <div className="grid size-20 place-items-center rounded-control bg-surface border border-border-strong text-2xl font-display font-bold text-primary shadow-sm">
                  {settings.name.slice(0, 1) || 'S'}
                </div>
                <p className="mt-3 font-display font-semibold text-sm text-foreground">
                  {settings.name || 'Subham Tiwari'}
                </p>
                <p className="font-mono text-xs text-muted mt-0.5">{settings.email || 'subham@stealthpay.io'}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-4 text-xs h-8 px-4 font-mono"
                  onClick={() => toast('Avatar update is simulated in demo')}
                >
                  Change Avatar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 2: SECURITY TAB */}
        {tab === 'security' && (
          <div className="space-y-4">
            {/* Two-Factor Authentication Card */}
            <Card className="p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid size-11 place-items-center rounded-control bg-primary-soft text-primary border border-primary/20 shrink-0">
                  <Smartphone className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">
                    Two-Factor Authentication
                  </h3>
                  <p className="font-sans text-xs text-muted mt-0.5">
                    Enforce time-based one-time password (TOTP) verification for all transactions.
                  </p>
                </div>
              </div>
              <Toggle
                checked={twoFactorEnabled}
                onChange={(val) => {
                  setTwoFactorEnabled(val)
                  toast(val ? '2FA Enabled' : '2FA Disabled', 'info')
                }}
                label="Two-factor authentication"
              />
            </Card>

            {/* Change Password Card */}
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="grid size-11 place-items-center rounded-control bg-accent-soft text-accent border border-accent/25 shrink-0">
                  <Lock className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Change Password</h3>
                  <p className="font-sans text-xs text-muted mt-0.5">
                    Maintain strong alphanumeric security for custodial signing permissions.
                  </p>
                </div>
              </div>

              <form
                className="space-y-3.5 max-w-md pt-3 border-t border-border"
                onSubmit={pw.handleSubmit(() => {
                  pw.reset()
                  toast('Password updated')
                })}
              >
                <Field label="Current Password" error={pw.formState.errors.current?.message}>
                  <div className="relative">
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="pr-10"
                      {...pw.register('current')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password" error={pw.formState.errors.next?.message}>
                  <div className="relative">
                    <Input
                      type={showNext ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                      {...pw.register('next')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNext(!showNext)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                    >
                      {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm New Password" error={pw.formState.errors.confirm?.message}>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      className="pr-10"
                      {...pw.register('confirm')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Button type="submit" size="sm" className="h-9 px-5 font-mono text-xs">
                  Save New Password
                </Button>
              </form>
            </Card>

            {/* Active Sessions Card */}
            <Card className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-border-strong transition-all">
              <div className="flex items-center gap-4">
                <span className="grid size-11 place-items-center rounded-control bg-surface-secondary text-muted border border-border shrink-0">
                  <Laptop className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground tracking-tight">Active Cryptographic Sessions</h3>
                  <p className="font-sans text-xs text-muted mt-0.5">
                    Review and revoke active signing tokens and ephemeral scanning sessions.
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted" />
            </Card>
          </div>
        )}

        {/* TAB 3: WALLET */}
        {tab === 'wallet' && (
          <Card className="p-6 space-y-5">
            <h2 className="font-display text-base font-semibold text-foreground tracking-tight">Wallet Configuration</h2>
            <div className="space-y-3">
              <div className="rounded-control border border-border bg-surface-secondary p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-muted">Connected Provider</p>
                  <p className="font-display font-semibold text-sm text-foreground mt-0.5">{wallet.provider}</p>
                </div>
                <span className="rounded-control bg-accent-soft text-accent text-xs font-mono font-semibold px-2.5 py-0.5 border border-accent/25">
                  Connected
                </span>
              </div>
              <div className="rounded-control border border-border bg-surface-secondary p-4">
                <p className="font-mono text-xs text-muted">Custodial Address</p>
                <p className="font-mono text-xs text-foreground mt-1 break-all">{wallet.address}</p>
              </div>
            </div>
            <Link href="/wallet" className="inline-block font-mono text-xs font-medium text-primary hover:underline pt-2">
              Go to Custodial Wallet Management →
            </Link>
          </Card>
        )}

        {/* TAB 4: PREFERENCES & THEME SELECTOR */}
        {tab === 'preferences' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-base font-semibold text-foreground tracking-tight">Theme & Visual System</h2>

            {/* Complete 3-Choice Theme Selector */}
            <div className="space-y-3 pb-6 border-b border-border">
              <div>
                <p className="font-display text-sm font-semibold text-foreground tracking-tight">Interface Theme</p>
                <p className="font-sans text-xs text-muted">
                  Switch between Chalk & Oxide (Light), Carbon & Copper (Dark), or synchronize with OS settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {[
                  {
                    mode: 'light',
                    label: 'Chalk & Oxide',
                    badge: 'Light Mode',
                    icon: Sun,
                    desc: 'Warm parchment surface with mineral oxide accents',
                  },
                  {
                    mode: 'dark',
                    label: 'Carbon & Copper',
                    badge: 'Dark Mode',
                    icon: Moon,
                    desc: 'Deep carbon panel with forged copper highlights',
                  },
                  {
                    mode: 'system',
                    label: 'System Default',
                    badge: 'Auto Sync',
                    icon: Monitor,
                    desc: 'Synchronizes dynamically with host operating system',
                  },
                ].map(({ mode, label, badge, icon: Icon, desc }) => {
                  const isSelected = settings.theme === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        updateSettings({ theme: mode as ThemeMode })
                        toast(`Theme switched to ${label}`)
                      }}
                      className={cn(
                        'flex flex-col items-start p-4 rounded-control border text-left transition-all cursor-pointer group relative',
                        isSelected
                          ? 'border-primary bg-primary-soft/30 text-foreground ring-1 ring-primary/40 shadow-sm'
                          : 'border-border bg-surface text-muted hover:border-border-strong hover:bg-surface-secondary'
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <Icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted group-hover:text-foreground')} />
                        <span className={cn(
                          'font-mono text-[10px] px-1.5 py-0.5 rounded-control font-semibold uppercase',
                          isSelected ? 'bg-primary text-white' : 'bg-surface-secondary text-muted'
                        )}>
                          {badge}
                        </span>
                      </div>
                      <span className="font-display text-sm font-semibold text-foreground tracking-tight">{label}</span>
                      <span className="font-sans text-xs text-muted mt-1 leading-relaxed">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Other Preferences */}
            <div className="space-y-4 divide-y divide-border">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Display Currency</p>
                  <p className="font-sans text-xs text-muted">Valuation currency for stealth vaults and balances</p>
                </div>
                <Select
                  value={settings.currency}
                  onChange={(e) => updateSettings({ currency: e.target.value as 'USD' | 'EUR' })}
                  className="w-32 h-9 text-xs font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-display text-sm font-medium text-foreground">Automatic Mempool Scanning</p>
                  <p className="font-sans text-xs text-muted">Continuous background viewing key detection for incoming transactions</p>
                </div>
                <Toggle checked={true} onChange={() => {}} label="Mempool scanning" />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 5: ABOUT */}
        {tab === 'about' && (
          <Card className="p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-foreground tracking-tight">About Stealth Pay</h2>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Stealth Pay is an engineered privacy-preserving cryptocurrency settlement platform based on the EIP-5564 standard. The system guarantees financial confidentiality by deriving single-use, unlinkable stealth destinations for every transaction while preserving a permanent, reusable meta-address for public reception.
            </p>
            <div className="rounded-control border border-border bg-surface-secondary p-4 font-mono text-xs text-muted space-y-1.5">
              <p><strong className="text-foreground">Design System:</strong> FORGE / SIGNAL (Engineered Privacy)</p>
              <p><strong className="text-foreground">Dual Theme:</strong> Chalk & Oxide / Carbon & Copper</p>
              <p><strong className="text-foreground">Standard:</strong> EIP-5564 Non-Interactive Stealth Addresses</p>
              <p><strong className="text-foreground">Core Cryptography:</strong> SECP256k1 Elliptic Curve Diffie-Hellman (ECDH)</p>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
