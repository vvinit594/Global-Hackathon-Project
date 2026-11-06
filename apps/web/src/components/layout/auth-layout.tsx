"use client"

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock, EyeOff, Fingerprint } from 'lucide-react'
import { Logo, Toasts } from '@/components/common'

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
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 mb-8 text-sm text-ink-soft">{subtitle}</p>
          {children}
          {footer && <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>}
        </div>
        <Link to="/" className="text-center text-xs text-ink-soft hover:underline">
          Back to home
        </Link>
      </div>
      <div className="hidden bg-sage-soft p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto max-w-md space-y-5">
          <p className="text-2xl leading-snug font-medium">
            Receive payments without publishing your wallet history.
          </p>
          {[
            [Fingerprint, 'One identity, many one-time addresses'],
            [EyeOff, 'Unlinkable payments by design'],
            [Lock, 'You hold the keys'],
          ].map(([I, t]) => {
            const Icon = I as typeof Lock
            return (
              <div key={t as string} className="flex items-center gap-3 rounded-2xl bg-card/70 p-4 text-sm">
                <span className="grid size-9 place-items-center rounded-xl bg-beige">
                  <Icon className="size-4" />
                </span>
                {t as string}
              </div>
            )
          })}
        </div>
      </div>
      <Toasts />
    </div>
  )
}
