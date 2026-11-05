"use client"

import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui'
import { activitySeries } from '@/data/mock-transactions'

export function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon: ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="grid size-9 place-items-center rounded-xl bg-sage-soft">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </Card>
  )
}

export function ActivityChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activitySeries} margin={{ left: -16, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8c8b2" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#b8c8b2" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d6c4a8" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#d6c4a8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8e8e5" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b6b66' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b6b66' }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e8e8e5', fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="received"
            name="Received (USD)"
            stroke="#8fa688"
            strokeWidth={2}
            fill="url(#gr)"
          />
          <Area
            type="monotone"
            dataKey="sent"
            name="Sent (USD)"
            stroke="#c4ad88"
            strokeWidth={2}
            fill="url(#gs)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function QuickAction({
  to,
  icon,
  label,
  desc,
}: {
  to: string
  icon: ReactNode
  label: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition hover:border-sage-deep hover:shadow-soft"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-beige transition group-hover:bg-sage">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-xs text-ink-soft">{desc}</span>
      </span>
    </Link>
  )
}
