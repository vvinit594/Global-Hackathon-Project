"use client"

import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/utils/format'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...p
}: BtnProps) {
  const v = {
    primary:
      'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.12)] active:translate-y-px transition-all',
    secondary:
      'bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--foreground)] font-medium border border-[var(--border)] active:translate-y-px transition-all',
    ghost:
      'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-secondary)] active:translate-y-px transition-all',
    danger:
      'bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border border-[var(--badge-danger-border)] hover:opacity-90 active:translate-y-px transition-all',
  }[variant]

  const s = {
    sm: 'h-8 px-3 text-xs rounded-control',
    md: 'h-10 px-4 text-sm rounded-input',
    lg: 'h-11 px-6 text-sm font-medium rounded-input',
  }[size]

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none',
        v,
        s,
        className
      )}
      {...p}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  )
}

export function Card({
  className,
  children,
  hover = false,
  ...p
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-[var(--color-card-shadow)] text-[var(--foreground)] transition-all duration-150',
        hover && 'hover:border-[var(--border-strong)] hover:shadow-md cursor-pointer',
        className
      )}
      {...p}
    >
      {children}
    </div>
  )
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'success' | 'warn' | 'danger' | 'neutral' | 'purple' | 'cyan'
  children: ReactNode
  className?: string
}) {
  const t = {
    success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)]',
    warn: 'bg-[var(--badge-warn-bg)] text-[var(--badge-warn-text)] border border-[var(--badge-warn-border)]',
    danger: 'bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] border border-[var(--badge-danger-border)]',
    neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border border-[var(--badge-neutral-border)]',
    purple: 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30',
    cyan: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/35',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-control px-2 py-0.5 text-[11px] font-mono font-medium tracking-tight transition-colors',
        t,
        className
      )}
    >
      {children}
    </span>
  )
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: ReactNode
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--foreground-secondary)]">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1.5 block text-xs text-[var(--muted)]">{hint}</span>
      )}
      {error && (
        <span role="alert" className="mt-1.5 block text-xs text-[var(--color-state-error)] font-medium">
          {error}
        </span>
      )}
    </label>
  )
}

const inputCls =
  'h-10 w-full rounded-input border border-[var(--border)] bg-[var(--color-input-bg)] px-3.5 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 font-sans'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => <input ref={ref} className={cn(inputCls, className)} {...p} />
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => (
    <textarea ref={ref} className={cn(inputCls, 'h-auto py-2.5 resize-none', className)} {...p} />
  )
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...p }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputCls,
        'cursor-pointer appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23647078%27 stroke-width=%272%27><path d=%27m6 9 6 6 6-6%27/></svg>")] bg-[length:14px] bg-[right_0.85rem_center] bg-no-repeat pr-9 text-[var(--foreground)]',
        className
      )}
      {...p}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 border border-transparent',
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform duration-150',
          checked && 'translate-x-4'
        )}
      />
    </button>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const prev = typeof document !== 'undefined' ? document.body.style.overflow : ''
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = prev
      }
      window.removeEventListener('keydown', h)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-panel border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[var(--color-modal-shadow)] text-[var(--foreground)] transition-colors animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="font-display text-base font-bold text-[var(--foreground)] tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-7 cursor-pointer place-items-center rounded-control text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
