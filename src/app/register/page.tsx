"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button, Field, Input } from '@/components/ui'
import { authService } from '@/services'
import { useAppStore } from '@/store/app-store'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[0-9]/, 'Include at least one number'),
    confirm: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })
type Values = z.infer<typeof schema>

export default function RegisterPage() {
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { login, updateSettings, toast } = useAppStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Values) => {
    await authService.register(v.name, v.email, v.password)
    updateSettings({ name: v.name, email: v.email })
    login()
    toast('Cryptographic vault provisioned')
    router.push('/dashboard')
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register an identity and provision a stealth meta-vault"
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="font-mono font-semibold text-primary hover:text-primary-hover hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full Name" error={errors.name?.message}>
          <Input
            placeholder="Subham Tiwari"
            autoComplete="name"
            {...register('name')}
          />
        </Field>

        <Field label="Email Address" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="operator@stealthpay.io"
            autoComplete="email"
            {...register('email')}
          />
        </Field>

        <Field label="Master Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted hover:text-foreground transition-colors"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <Field label="Confirm Master Password" error={errors.confirm?.message}>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="new-password"
              className="pr-11"
              {...register('confirm')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="pt-1">
          <label className="flex cursor-pointer items-start gap-2 text-xs text-foreground-secondary">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded-control border-border bg-surface text-primary focus:ring-primary accent-primary"
              {...register('terms')}
            />
            <span className="font-sans leading-relaxed">
              I agree to the <span className="text-primary hover:underline">Terms of Service</span> and{' '}
              <span className="text-primary hover:underline">Cryptographic Disclosure</span>
            </span>
          </label>
          {errors.terms && (
            <p className="mt-1 font-mono text-xs text-state-error">{errors.terms.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-2 h-10 font-medium text-xs" loading={isSubmitting}>
          Provision Account
        </Button>
      </form>
    </AuthLayout>
  )
}
