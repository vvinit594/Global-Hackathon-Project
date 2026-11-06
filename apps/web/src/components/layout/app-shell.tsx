"use client"

import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Fingerprint, ArrowDownToLine, Send, History, Wallet, Settings, LogOut, Menu, X } from 'lucide-react'
import { Logo, Toasts } from '@/components/common'
import { useAppStore } from '@/store/app-store'
import { cn, shorten } from '@/utils/format'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/identity', label: 'My Identity', icon: Fingerprint },
  { to: '/receive', label: 'Receive', icon: ArrowDownToLine },
  { to: '/send', label: 'Send', icon: Send },
  { to: '/transactions', label: 'Transactions', icon: History },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { notifications, settings, wallet, logout } = useAppStore()
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.read).length

  const links = (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)}
          className={({ isActive }: { isActive: boolean }) => cn('flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-sage text-ink' : 'text-ink-soft hover:bg-sage-soft hover:text-ink')}>
          <Icon className="size-[18px]" /> {label}
          {label === 'Notifications' && unread > 0 && <span className="ml-auto rounded-full bg-beige px-2 py-0.5 text-xs text-ink">{unread}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-line bg-card p-5 lg:flex">
        <div className="space-y-8"><Logo to="/dashboard" />{links}</div>
        <button onClick={() => { logout(); navigate('/login') }} className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-ink-soft hover:bg-sage-soft">
          <LogOut className="size-[18px]" /> Log out
        </button>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/30" />
          <aside className="relative flex h-full w-72 flex-col justify-between bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-8"><Logo to="/dashboard" />{links}</div>
            <button onClick={() => { logout(); navigate('/login') }} className="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-ink-soft"><LogOut className="size-[18px]" /> Log out</button>
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-8">
          <button className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-sage-soft lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs text-ink-soft sm:flex">
            <span className={cn('size-2 rounded-full', wallet.connected ? 'bg-sage-deep' : 'bg-line')} />
            {wallet.connected ? `${wallet.network} · ${shorten(wallet.address, 6, 4)}` : 'Wallet not connected'}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full hover:bg-sage-soft">
              <Bell className="size-5" />
              {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-danger" />}
            </Link>
            <Link to="/settings" className="grid size-10 place-items-center rounded-full bg-beige text-sm font-semibold" aria-label="Profile">
              {settings.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children || <Outlet />}</main>
      </div>
      <Toasts />
    </div>
  )
}
