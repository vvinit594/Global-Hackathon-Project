"use client"

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { Logo, Toasts } from '@/components/common'
import { useAppStore } from '@/store/app-store'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
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
    <div className="relative min-h-screen flex flex-col justify-between bg-[var(--background)] text-[var(--foreground)] px-4 py-8 transition-colors duration-200">
      {/* Top Header */}
      <div className="relative z-10 mx-auto w-full max-w-md flex justify-between items-center mb-6">
        <Logo />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleQuickTheme}
            aria-label="Toggle theme"
            className="grid size-7 place-items-center rounded-control border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {isDarkNow ? <Sun className="size-3.5 text-[var(--warning)]" /> : <Moon className="size-3.5 text-[var(--primary)]" />}
          </button>
          <Link
            href="/"
            className="text-xs font-mono text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            Return to Overview →
          </Link>
        </div>
      </div>

      {/* Centered Structured Card */}
      <div className="relative z-10 mx-auto w-full max-w-md my-auto">
        <div className="rounded-panel border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-[var(--color-card-shadow)] transition-colors duration-200">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--primary)] font-semibold">
              AUTHENTICATION GATEWAY
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
              {title}
            </h1>
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{subtitle}</p>
          </div>

          {children}

          {footer && (
            <div className="mt-5 border-t border-[var(--border)] pt-4 text-center text-xs text-[var(--foreground-secondary)]">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Architectural Stamp */}
      <div className="relative z-10 text-center text-[11px] font-mono text-[var(--muted)] mt-8">
        STEALTH PAY PROTOCOL · EIP-5564 COMPLIANT FINTECH INFRASTRUCTURE
      </div>

      <Toasts />
    </div>
  )
}
