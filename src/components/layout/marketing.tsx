"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { Logo } from '@/components/common'
import { Button } from '@/components/ui'
import { useAppStore } from '@/store/app-store'

const links = [
  ['Overview', '#overview'],
  ['Architecture', '#architecture'],
  ['Protocol', '#protocol'],
  ['Security', '#security'],
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  const { updateSettings } = useAppStore()
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
    updateSettings({ theme: isDarkNow ? 'light' : 'dark' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-xs font-mono uppercase tracking-wider text-[var(--foreground-secondary)] md:flex">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              className="hover:text-[var(--primary)] transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <button
            onClick={toggleQuickTheme}
            aria-label="Toggle theme"
            className="grid size-8 place-items-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
          >
            {isDarkNow ? <Sun className="size-3.5 text-[var(--warning)]" /> : <Moon className="size-3.5 text-[var(--primary)]" />}
          </button>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs h-8">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="text-xs h-8 font-mono">
              Launch App →
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleQuickTheme}
            aria-label="Toggle theme"
            className="grid size-8 place-items-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
          >
            {isDarkNow ? <Sun className="size-3.5 text-[var(--warning)]" /> : <Moon className="size-3.5 text-[var(--primary)]" />}
          </button>
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 md:hidden">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              onClick={() => setOpen(false)}
              className="block rounded-control px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--foreground-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)]"
            >
              {l}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full text-xs">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full text-xs font-mono">
                Launch App →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Privacy-preserving payment infrastructure on EVM networks. Every payment routes to an unlinkable, single-use stealth address.
          </p>
          <p className="text-[11px] font-mono text-[var(--muted)]">
            SPEC: EIP-5564 · FORGE / SIGNAL
          </p>
        </div>
        {[
          [
            'Product',
            [
              ['Dashboard', '/dashboard'],
              ['Send Payment', '/send'],
              ['Receive Payment', '/receive'],
              ['My Identity', '/identity'],
            ],
          ],
          [
            'Protocol',
            [
              ['EIP-5564 Spec', 'https://eips.ethereum.org/EIPS/eip-5564'],
              ['Diffie-Hellman Key Exchange', '#protocol'],
              ['Secp256k1 Curve', '#security'],
              ['Nullifiers & Announcements', '#architecture'],
            ],
          ],
          [
            'Security',
            [
              ['Non-Custodial Design', '#security'],
              ['In-Memory Private Keys', '#security'],
              ['Zero Metadata Leakage', '#security'],
              ['Audit Log', '/transactions'],
            ],
          ],
        ].map(([title, links]) => (
          <div key={title as string}>
            <p className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--foreground)] mb-3">
              {title as string}
            </p>
            <ul className="space-y-2 text-xs text-[var(--foreground-secondary)]">
              {(links as [string, string][]).map(([label, href]) => (
                <li key={label}>
                  {href.startsWith('http') || href.startsWith('#') ? (
                    <a
                      href={href}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs font-mono text-[var(--muted)]">
        STEALTH PAY PROTOCOL · ENGINEERED PRIVACY. CLEAR FINANCIAL CONTROL.
      </div>
    </footer>
  )
}
