"use client"

import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Fingerprint, SlidersHorizontal, Shield, User, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Card, Field, Input, Select, Toggle } from '@/components/ui'
import { PageHeader } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn, shorten } from '@/utils/format'

const tabs = [
  ['profile', 'Profile', User],
  ['security', 'Security', Shield],
  ['wallet', 'Wallet', Wallet],
  ['identity', 'Stealth Identity', Fingerprint],
  ['preferences', 'Preferences', SlidersHorizontal],
  ['notifications', 'Notifications', Bell],
] as const
type Tab = (typeof tabs)[number][0]

const profileSchema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
})
const pwSchema = z
  .object({
    current: z.string().min(1, 'Required'),
    next: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {desc && <p className="text-xs text-ink-soft">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const { settings, updateSettings, wallet, identity, toast } = useAppStore()
  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: settings.name, email: settings.email },
  })
  const pw = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) })

  return (
    <AppShell>
      <div>
        <PageHeader title="Settings" description="Manage your account and preferences." />
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map(([k, l, I]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-medium transition',
                  tab === k
                    ? 'bg-sage text-ink font-semibold'
                    : 'text-ink-soft hover:bg-sage-soft hover:text-ink'
                )}
              >
                <I className="size-4" />
                {l}
              </button>
            ))}
          </nav>
          <Card className="p-6">
            {tab === 'profile' && (
              <form
                className="max-w-md space-y-4"
                noValidate
                onSubmit={profile.handleSubmit((v) => {
                  updateSettings(v)
                  toast('Profile saved')
                })}
              >
                <h2 className="font-semibold text-ink">Profile</h2>
                <Field label="Full name" error={profile.formState.errors.name?.message}>
                  <Input {...profile.register('name')} />
                </Field>
                <Field label="Email" error={profile.formState.errors.email?.message}>
                  <Input type="email" {...profile.register('email')} />
                </Field>
                <Button type="submit">Save changes</Button>
              </form>
            )}
            {tab === 'security' && (
              <div className="max-w-md">
                <h2 className="mb-2 font-semibold text-ink">Security</h2>
                <Row title="Two-factor authentication" desc="Demo toggle only">
                  <Toggle
                    label="Two-factor"
                    checked={settings.twoFactor}
                    onChange={(v) => {
                      updateSettings({ twoFactor: v })
                      toast(v ? '2FA enabled (demo)' : '2FA disabled', 'info')
                    }}
                  />
                </Row>
                <form
                  className="mt-4 space-y-4 border-t border-line pt-5"
                  noValidate
                  onSubmit={pw.handleSubmit(() => {
                    pw.reset()
                    toast('Password updated (demo)')
                  })}
                >
                  <p className="text-sm font-medium text-ink">Change password</p>
                  <Field label="Current password" error={pw.formState.errors.current?.message}>
                    <Input type="password" {...pw.register('current')} />
                  </Field>
                  <Field label="New password" error={pw.formState.errors.next?.message}>
                    <Input type="password" {...pw.register('next')} />
                  </Field>
                  <Field label="Confirm new password" error={pw.formState.errors.confirm?.message}>
                    <Input type="password" {...pw.register('confirm')} />
                  </Field>
                  <Button type="submit">Update password</Button>
                </form>
              </div>
            )}
            {tab === 'wallet' && (
              <div>
                <h2 className="mb-3 font-semibold text-ink">Wallet</h2>
                <p className="text-sm text-ink-soft">
                  {wallet.connected
                    ? `${wallet.provider} on ${wallet.network} · ${shorten(wallet.address, 8, 6)}`
                    : 'No wallet connected.'}
                </p>
                <Link to="/wallet">
                  <Button variant="ghost" className="mt-4">
                    Open wallet management
                  </Button>
                </Link>
              </div>
            )}
            {tab === 'identity' && (
              <div>
                <h2 className="mb-3 font-semibold text-ink">Stealth Identity</h2>
                <p className="text-sm text-ink-soft">
                  {identity
                    ? `Active. Meta-address: ${shorten(identity.metaAddress, 14, 6)}`
                    : 'No identity generated yet.'}
                </p>
                <Link to="/identity">
                  <Button variant="ghost" className="mt-4">
                    {identity ? 'View identity' : 'Generate identity'}
                  </Button>
                </Link>
              </div>
            )}
            {tab === 'preferences' && (
              <div className="max-w-md divide-y divide-line">
                <h2 className="pb-2 font-semibold text-ink">Preferences</h2>
                <Row title="Dark theme" desc="Switch between light and dark">
                  <Toggle
                    label="Dark theme"
                    checked={settings.theme === 'dark'}
                    onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
                  />
                </Row>
                <Row title="Display currency">
                  <div className="w-32">
                    <Select
                      value={settings.currency}
                      onChange={(e) => {
                        updateSettings({ currency: e.target.value })
                        toast('Currency updated', 'info')
                      }}
                    >
                      {['USD', 'EUR', 'GBP'].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                </Row>
              </div>
            )}
            {tab === 'notifications' && (
              <div className="max-w-md divide-y divide-line">
                <h2 className="pb-2 font-semibold text-ink">Notification settings</h2>
                {(
                  [
                    ['notifyIncoming', 'Incoming payments'],
                    ['notifyConfirmed', 'Confirmed transactions'],
                    ['notifyFailed', 'Failed transactions'],
                    ['notifyEmail', 'Email notifications'],
                  ] as const
                ).map(([k, l]) => (
                  <Row key={k} title={l}>
                    <Toggle
                      label={l}
                      checked={settings[k]}
                      onChange={(v) => updateSettings({ [k]: v })}
                    />
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
