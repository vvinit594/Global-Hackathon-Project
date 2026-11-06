"use client"

import React, { useMemo } from 'react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string
  href?: string
  replace?: boolean
}

export function Link({ to, href, replace, children, ...rest }: LinkProps) {
  const target = to || href || '#'
  return (
    <NextLink href={target} replace={replace} {...rest}>
      {children}
    </NextLink>
  )
}

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean }) => string)
  end?: boolean
}

export function NavLink({ to, href, className, children, end, ...rest }: NavLinkProps) {
  const pathname = usePathname()
  const target = to || href || '#'
  const isActive = end ? pathname === target : pathname === target || pathname?.startsWith(target + '/')
  const resolvedClass = typeof className === 'function' ? className({ isActive }) : className

  return (
    <NextLink href={target} className={resolvedClass} {...rest}>
      {children}
    </NextLink>
  )
}

export function useNavigate() {
  const router = useRouter()
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (typeof window !== 'undefined') window.history.go(to)
    } else {
      if (options?.replace) {
        router.replace(to)
      } else {
        router.push(to)
      }
    }
  }
}

export function useLocation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return useMemo(() => ({
    pathname: pathname || '/',
    search: searchParams ? `?${searchParams.toString()}` : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state: null,
    key: 'default',
  }), [pathname, searchParams])
}

export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter()
  React.useEffect(() => {
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [to, replace, router])
  return null
}
