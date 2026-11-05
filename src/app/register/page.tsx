"use client"

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      errorMap: () => ({ message: 'You must accept the terms' }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })
type Values = z.infer<typeof schema>

export default function RegisterPage() {
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
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
    toast('Account created (demo)')
    navigate('/dashboard')
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start receiving payments privately."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-ink underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name?.message}>
          <Input placeholder="Amara Okafor" {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="you@example.com" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              className="pr-11"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label="Toggle password visibility"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-ink-soft"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm password" error={errors.confirm?.message}>
          <Input
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirm')}
          />
        </Field>
        <div>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[#8fa688]"
              {...register('terms')}
            />
            <span>I agree to the Terms and Conditions and Privacy Policy.</span>
          </label>
          {errors.terms && (
            <p role="alert" className="mt-1.5 text-xs text-danger">
              {errors.terms.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
