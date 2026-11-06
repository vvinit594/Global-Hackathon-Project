"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button, Field, Input } from '@/components/ui'
import { authService } from '@/services'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  return (
    <AuthLayout
      title="Recover Access"
      subtitle="Enter your email to receive recovery instructions"
      footer={
        <Link href="/login" className="font-mono font-semibold text-primary hover:text-primary-hover hover:underline">
          Return to Sign In
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-card border border-accent/30 bg-accent-soft p-6 text-center">
          <MailCheck className="mx-auto mb-3 size-8 text-accent" />
          <p className="font-display font-medium text-foreground text-sm">Check your inbox</p>
          <p className="mt-1 font-mono text-xs text-muted">
            Cryptographic reset challenge generated for {sent}.
          </p>
          <Button
            variant="secondary"
            className="mt-4 text-xs h-9 w-full font-mono"
            onClick={() => setSent('')}
          >
            Try another email
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(async (v) => {
            await authService.requestPasswordReset(v.email)
            setSent(v.email)
          })}
          className="space-y-4"
          noValidate
        >
          <Field label="Email Address" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="operator@stealthpay.io"
              autoComplete="email"
              {...register('email')}
            />
          </Field>
          <Button type="submit" className="w-full mt-2 h-10 font-medium text-xs" loading={isSubmitting}>
            Send Recovery Link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
