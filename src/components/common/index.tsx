"use client"

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, CheckCircle2, AlertCircle, Info, Shield } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useCopy } from '@/hooks/use-copy'
import { downloadQr } from '@/hooks/use-downloads'
import { useAppStore } from '@/store/app-store'
import { Button, Card } from '@/components/ui'
import { cn } from '@/utils/format'

/**
 * FORGE / SIGNAL Architectural Geometric Shield Identity
 * Precision-cut angles, controlled negative space, central signal conduit
 */
export function StealthShieldSymbol({ className = 'size-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Stealth Pay Shield"
    >
      {/* Outer architectural faceted shield plate */}
      <path
        d="M16 2 L29 7.5 L29 18.5 C29 26.2 23.4 32.2 16 34.5 C8.6 32.2 3 26.2 3 18.5 L3 7.5 Z"
        fill="var(--primary)"
      />
      {/* Top chamfer structural bevel */}
      <path
        d="M16 2 L29 7.5 L16 12 L3 7.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      {/* Left faceted shadow facet */}
      <path
        d="M3 7.5 L16 12 L16 34.5 C8.6 32.2 3 26.2 3 18.5 Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Center geometric protected signal conduit / aperture */}
      <path
        d="M16 9 L21 14.5 L17.5 14.5 L17.5 25 L14.5 25 L14.5 14.5 L11 14.5 Z"
        fill="var(--surface-elevated)"
      />
    </svg>
  )
}

export function Logo({ to = '/', className }: { to?: string; className?: string }) {
  return (
    <Link href={to} className={cn('flex items-center gap-2.5 group select-none', className)}>
      <div className="grid size-8 place-items-center rounded-control bg-[var(--surface-secondary)] border border-[var(--border-strong)] transition-transform group-hover:scale-105 shadow-sm">
        <StealthShieldSymbol className="size-5 text-[var(--foreground)]" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-base font-bold tracking-tight text-[var(--foreground)]">
          STEALTH
        </span>
        <span className="font-display text-base font-bold tracking-tight text-[var(--primary)]">
          PAY
        </span>
        <span className="size-1 rounded-full bg-[var(--accent)] ml-0.5" />
      </div>
    </Link>
  )
}

export function CopyButton({
  text,
  label = 'Copy',
  className,
}: {
  text: string
  label?: string
  className?: string
}) {
  const { copied, copy } = useCopy()
  const done = copied === text
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={cn('text-xs h-7 px-2.5 font-mono border-[var(--border)]', className)}
      onClick={() => copy(text)}
    >
      {done ? (
        <Check className="size-3 text-[var(--accent)]" />
      ) : (
        <Copy className="size-3 text-[var(--muted)]" />
      )}
      <span className={done ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}>
        {done ? 'Copied' : label}
      </span>
    </Button>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function QRPreview({
  value,
  name,
  size = 176,
}: {
  value: string
  name: string
  size?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={ref}
        className="rounded-input border border-[var(--border-strong)] bg-white p-3 shadow-sm"
      >
        <QRCodeCanvas value={value} size={size} fgColor="#14191D" bgColor="#FFFFFF" level="M" />
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="text-xs h-7 px-3 font-mono"
        onClick={() => downloadQr(ref.current, name)}
      >
        <Download className="size-3 text-[var(--primary)]" /> Export QR
      </Button>
    </div>
  )
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-input border border-[var(--border)] bg-[var(--surface-secondary)] px-3.5 py-2 text-xs text-[var(--foreground-secondary)]',
        className
      )}
    >
      <span className="flex size-1.5 rounded-full bg-[var(--primary)]" />
      <span className="font-mono text-[11px] font-medium tracking-wide uppercase text-[var(--muted)]">
        PROTOCOL PROTOTYPE
      </span>
      <span className="text-[var(--border-strong)]">|</span>
      <span className="truncate">Simulated EIP-5564 stealth cryptographic events. No mainnet assets used.</span>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-8 text-center border-dashed">
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-control bg-[var(--surface-secondary)] text-[var(--muted)] border border-[var(--border)]">
        <Shield className="size-5" />
      </div>
      <p className="font-display font-bold text-sm text-[var(--foreground)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{body}</p>
    </Card>
  )
}

export function Toasts() {
  const { toasts, dismissToast } = useAppStore()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="pointer-events-auto flex cursor-pointer items-center gap-2.5 rounded-input border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-4 py-2.5 text-xs text-[var(--foreground)] shadow-lg hover:border-[var(--primary)] transition-all font-sans"
        >
          {t.tone === 'error' ? (
            <AlertCircle className="size-3.5 text-[var(--color-state-error)]" />
          ) : t.tone === 'info' ? (
            <Info className="size-3.5 text-[var(--accent)]" />
          ) : (
            <CheckCircle2 className="size-3.5 text-[var(--accent)]" />
          )}
          <span>{t.message}</span>
        </button>
      ))}
    </div>
  )
}
