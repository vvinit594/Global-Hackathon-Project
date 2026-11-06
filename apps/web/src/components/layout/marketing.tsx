"use client"

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/common'
import { Button } from '@/components/ui'

const links = [
  ['Problem', '#problem'],
  ['How it works', '#how'],
  ['Features', '#features'],
  ['Security', '#security'],
  ['Docs', '#docs'],
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="hover:text-ink">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
        <button
          className="grid size-10 cursor-pointer place-items-center md:hidden"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-line bg-canvas px-5 py-4 md:hidden">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm hover:bg-sage-soft"
            >
              {l}
            </a>
          ))}
          <div className="flex gap-2 pt-3">
            <Link to="/login" className="flex-1">
              <Button variant="ghost" className="w-full">
                Log in
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full">Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-ink-soft">Privacy-preserving payments, designed for people.</p>
        </div>
        {[
          [
            'Product',
            [
              ['Dashboard', '/dashboard'],
              ['Send', '/send'],
              ['Receive', '/receive'],
            ],
          ],
          [
            'Account',
            [
              ['Log in', '/login'],
              ['Register', '/register'],
              ['Settings', '/settings'],
            ],
          ],
          [
            'Resources',
            [
              ['Documentation', '#docs'],
              ['Security', '#security'],
              ['Features', '#features'],
            ],
          ],
        ].map(([t, items]) => (
          <div key={t as string}>
            <p className="mb-3 text-sm font-semibold">{t as string}</p>
            <ul className="space-y-2 text-sm text-ink-soft">
              {(items as string[][]).map(([l, h]) => (
                <li key={l}>
                  {h && h.startsWith('#') ? (
                    <a href={h} className="hover:text-ink">
                      {l}
                    </a>
                  ) : (
                    <Link to={h} className="hover:text-ink">
                      {l}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-ink-soft">
        © 2025 Stealth Pay. Hackathon frontend prototype; no real transactions are processed.
      </p>
    </footer>
  )
}
