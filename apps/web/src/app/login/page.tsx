"use client"

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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
      setError('Invalid email or password (demo error state).')
      return
    }
    login()
    toast('Signed in (demo session)')
    navigate('/dashboard')
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Stealth Pay account."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-ink underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-ink-soft"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 accent-[#8fa688]" {...register('remember')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-ink-soft underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            connectWallet('MetaMask')
            login()
            toast('Demo wallet connected', 'info')
            navigate('/dashboard')
          }}
        >
          <Wallet className="size-4" /> Connect wallet
        </Button>
        <p className="text-center text-xs text-ink-soft">
          Demo tip: use password "wrongpass" to preview the error state.
        </p>
      </form>
    </AuthLayout>
  )
}
