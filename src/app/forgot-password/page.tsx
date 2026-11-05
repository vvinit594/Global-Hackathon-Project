"use client"

import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      title="Reset your password"
      subtitle="We'll send reset instructions to your email."
      footer={
        <Link to="/login" className="font-medium text-ink underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-3xl bg-sage-soft p-6 text-center">
          <MailCheck className="mx-auto mb-3 size-8 text-sage-deep" />
          <p className="font-medium text-ink">Check your inbox</p>
          <p className="mt-1 text-sm text-ink-soft">
            Demo: no email was actually sent to {sent}.
          </p>
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
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
          </Field>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
