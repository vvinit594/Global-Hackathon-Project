"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Wallet } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button, Field, Input } from '@/components/ui'
import { authService } from '@/services'
import { useAppStore } from '@/store/app-store'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, connectWallet, toast } = useAppStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  const onSubmit = async (v: Values) => {
    setError('')
    await authService.login(v.email, v.password)
    if (v.password.toLowerCase() === 'wrongpass') {
      setError('Invalid cryptographic credentials (demo error simulation).')
      return
    }
    login()
    toast('Session authenticated')
    router.push('/dashboard')
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Stealth Pay vault"
      footer={
        <>
          Don&apos;t have an identity registered?{' '}
          <Link href="/register" className="font-mono font-semibold text-primary hover:text-primary-hover hover:underline">
            Register identity
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-state-error/30 bg-state-error/10 px-4 py-3 font-mono text-xs text-state-error">
            {error}
          </div>
        )}

        <Field label="Email Address" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="operator@stealthpay.io"
            autoComplete="email"
            {...register('email')}
          />
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
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

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-foreground-secondary font-sans">
            <input
              type="checkbox"
              className="size-4 rounded-control border-border bg-surface text-primary focus:ring-primary accent-primary"
              {...register('remember')}
            />
            Remember session
          </label>
          <Link href="/forgot-password" className="font-mono text-xs text-muted hover:text-foreground hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full mt-2 h-10 font-medium text-xs" loading={isSubmitting}>
          Sign In
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute bg-surface px-3 font-mono text-[10px] text-muted uppercase tracking-wider">
            Or authenticate with
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full h-10 text-xs font-mono"
          onClick={() => {
            connectWallet('MetaMask')
            login()
            toast('Connected MetaMask & Authenticated')
            router.push('/dashboard')
          }}
        >
          <Wallet className="size-3.5 text-primary" /> Connect Web3 Wallet
        </Button>
      </form>
    </AuthLayout>
  )
}
