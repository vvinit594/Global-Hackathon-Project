"use client"

import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Download, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { useCopy } from '@/hooks/use-copy'
import { downloadQr } from '@/hooks/use-downloads'
import { useAppStore } from '@/store/app-store'
import { Button, Card } from '@/components/ui'
import { cn } from '@/utils/format'

export function Logo({ to = '/', className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5 font-semibold tracking-tight text-ink', className)}>
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        <img src="/logo.png" alt="Stealth Pay Logo" className="size-full object-contain p-0.5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-ink">Stealth Pay</span>
    </Link>
  )
}

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy()
  const done = copied === text
  return (
    <Button type="button" variant="ghost" size="sm" className={className} onClick={() => copy(text)}>
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
      {done ? 'Copied' : label}
    </Button>
  )
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function QRPreview({ value, name, size = 176 }: { value: string; name: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={ref} className="rounded-2xl border border-line bg-white p-4">
        <QRCodeCanvas value={value} size={size} fgColor="#343434" bgColor="#ffffff" level="M" />
      </div>
      <Button variant="ghost" size="sm" onClick={() => downloadQr(ref.current, name)}>
        <Download className="size-4" /> Download QR
      </Button>
    </div>
  )
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-2xl bg-beige-soft px-4 py-3 text-xs text-ink-soft', className)}>
      <Info className="mt-0.5 size-4 shrink-0" />
      <span>Prototype only. All data is mock data; no real blockchain transactions or cryptographic keys are created.</span>
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="p-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{body}</p>
    </Card>
  )
}

export function Toasts() {
  const { toasts, dismissToast } = useAppStore()
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <button key={t.id} onClick={() => dismissToast(t.id)}
          className="pointer-events-auto flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3 text-sm shadow-pop">
          {t.tone === 'error' ? <AlertCircle className="size-4 text-danger" /> : t.tone === 'info' ? <Info className="size-4" /> : <CheckCircle2 className="size-4 text-sage-deep" />}
          {t.message}
        </button>
      ))}
    </div>
  )
}
