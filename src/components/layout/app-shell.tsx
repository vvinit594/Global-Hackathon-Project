"use client"

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  LayoutDashboard,
  Fingerprint,
  ArrowDownToLine,
  Send,
  History,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Sun,
  Moon,
} from 'lucide-react'
import { Logo, Toasts } from '@/components/common'
import { useAppStore } from '@/store/app-store'
import { cn, shorten } from '@/utils/format'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/identity', label: 'Identity', icon: Fingerprint },
  { to: '/receive', label: 'Receive', icon: ArrowDownToLine },
  { to: '/send', label: 'Send', icon: Send },
  { to: '/transactions', label: 'Transactions', icon: History },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { notifications, settings, updateSettings, wallet, logout } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const unread = notifications.filter((n) => !n.read).length

  const [isDarkNow, setIsDarkNow] = useState(false)

  useEffect(() => {
    const updateDarkState = () => {
      if (typeof document !== 'undefined') {
        setIsDarkNow(document.documentElement.classList.contains('dark'))
      }
    }
    updateDarkState()
    const observer = new MutationObserver(updateDarkState)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => observer.disconnect()
  }, [])

  const toggleQuickTheme = () => {
    const nextTheme = isDarkNow ? 'light' : 'dark'
    updateSettings({ theme: nextTheme })
  }

  const currentNav = nav.find((n) => n.to === pathname) || {
    label: 'Stealth Pay',
    subtitle: 'Engineered privacy. Clear financial control.',
  }

  const pageSubtitles: Record<string, string> = {
    '/dashboard': 'Private payment overview and stealth address vault',
    '/identity': 'Reusable stealth meta-address and cryptographic keys',
    '/receive': 'Share your stealth address and receive private payments',
    '/send': 'Send payments to stealth destinations privately',
    '/transactions': 'Immutable stealth payment audit log',
    '/wallet': 'Manage connected custodial funds and active networks',
    '/notifications': 'Cryptographic event feed and payment alerts',
    '/settings': 'Account security, theme mode, and preferences',
  }

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => {
        const isActive = pathname === to
        return (
          <Link
            key={to}
            href={to}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-control px-3 py-2 text-xs font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary text-white font-semibold shadow-sm'
                : 'text-foreground-secondary hover:bg-surface-secondary hover:text-foreground'
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="font-sans">{label}</span>
            {label === 'Notifications' && unread > 0 && (
              <span className={cn(
                'ml-auto rounded-control px-1.5 py-0.5 text-[10px] font-mono font-bold',
                isActive ? 'bg-white/20 text-white' : 'bg-primary-soft text-primary'
              )}>
                {unread}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  const profileWidget = (
    <div className="flex items-center justify-between border-t border-border pt-3.5">
      <Link
        href="/settings"
        className="flex items-center gap-2.5 group min-w-0"
        onClick={() => setOpen(false)}
      >
        <div className="grid size-8 shrink-0 place-items-center rounded-control bg-primary text-xs font-mono font-bold text-white shadow-sm">
          {settings.name.slice(0, 1) || 'S'}
        </div>
        <div className="min-w-0 truncate">
          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {settings.name || 'Subham Tiwari'}
          </p>
          <p className="text-[11px] font-mono text-muted truncate">
            {settings.email || 'subham@stealthpay.io'}
          </p>
        </div>
      </Link>
      <button
        onClick={() => {
          logout()
          router.push('/login')
        }}
        aria-label="Log out"
        className="grid size-7 shrink-0 place-items-center rounded-control text-muted hover:bg-surface-secondary hover:text-state-error transition-colors cursor-pointer"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[240px_1fr] overflow-x-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-border bg-surface p-4 lg:flex z-40 transition-colors duration-200">
        <div className="space-y-6">
          <Logo to="/dashboard" />
          <div className="pt-2">
            <span className="mb-2 block px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted">
              VAULT REGISTRY
            </span>
            {links}
          </div>
        </div>
        {profileWidget}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" />
          <aside
            className="relative flex h-full w-72 max-w-[85vw] flex-col justify-between border-r border-border bg-surface p-4 shadow-xl transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <Logo to="/dashboard" />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-8 cursor-pointer place-items-center rounded-control text-muted hover:bg-surface-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              {links}
            </div>
            {profileWidget}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-screen min-w-0 flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              className="grid size-8 cursor-pointer place-items-center rounded-control border border-border bg-surface text-foreground hover:bg-surface-secondary lg:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>

            <div>
              <h1 className="font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                {currentNav.label}
              </h1>
              <p className="hidden text-[11px] font-mono text-muted sm:block">
                {pageSubtitles[pathname] || 'Engineered privacy. Clear financial control.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Theme Toggle Button */}
            <button
              onClick={toggleQuickTheme}
              aria-label={`Switch to ${isDarkNow ? 'Light' : 'Dark'} mode`}
              title={`Theme: ${settings.theme} (click to toggle)`}
              className="grid size-8 place-items-center rounded-control border border-border bg-surface text-muted hover:text-foreground hover:border-border-strong transition-all cursor-pointer"
            >
              {isDarkNow ? (
                <Sun className="size-3.5 text-warning" />
              ) : (
                <Moon className="size-3.5 text-primary" />
              )}
            </button>

            {/* Search Button */}
            <Link
              href="/transactions"
              aria-label="Search transactions"
              className="grid size-8 place-items-center rounded-control border border-border bg-surface text-muted hover:text-foreground hover:border-border-strong transition-all"
            >
              <Search className="size-3.5" />
            </Link>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative grid size-8 place-items-center rounded-control border border-border bg-surface text-muted hover:text-foreground hover:border-border-strong transition-all"
            >
              <Bell className="size-3.5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
              )}
            </Link>

            {/* Connected Wallet Pill */}
            <Link
              href="/wallet"
              className="flex items-center gap-2 rounded-control border border-border bg-surface-secondary px-2.5 py-1 text-xs hover:border-border-strong transition-all"
            >
              <span
                className={cn(
                  'size-1.5 rounded-full shrink-0',
                  wallet.connected ? 'bg-accent' : 'bg-muted'
                )}
              />
              <span className="text-[11px] font-mono text-foreground-secondary">
                {wallet.connected ? 'SYNCED' : 'OFFLINE'}
              </span>
              {wallet.connected && (
                <span className="font-mono text-[11px] text-foreground hidden sm:inline border-l border-border pl-1.5">
                  {shorten(wallet.address, 4, 3)}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-6 flex-1">
          {children}
        </main>
      </div>

      <Toasts />
    </div>
  )
}
