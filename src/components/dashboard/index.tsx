"use client"

import { useState, useEffect, type ReactNode } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui'
import { fmtUsd } from '@/utils/format'

export function StatCard({
  label,
  value,
  sub,
  badge,
  badgeTone = 'success',
  icon,
}: {
  label: string
  value: string
  sub?: string
  badge?: string
  badgeTone?: 'success' | 'warn' | 'purple' | 'cyan'
  icon?: ReactNode
}) {
  const badgeCls = {
    success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)]',
    warn: 'bg-[var(--badge-warn-bg)] text-[var(--badge-warn-text)] border border-[var(--badge-warn-border)]',
    purple: 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30',
    cyan: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/35',
  }[badgeTone]

  return (
    <Card className="p-4 sm:p-5 relative border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
        </span>
        {icon && (
          <span className="grid size-7 place-items-center rounded-control bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--primary)]">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2.5">
        <p className="font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {value}
        </p>
        {badge && (
          <span className={`inline-flex items-center rounded-control px-1.5 py-0.5 text-[10px] font-mono font-medium ${badgeCls}`}>
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 font-mono text-xs text-[var(--foreground-secondary)]">{sub}</p>}
    </Card>
  )
}

const weeklyData = [
  { day: 'Mon', eth: 0.35, usd: 710 },
  { day: 'Tue', eth: 0.82, usd: 1640 },
  { day: 'Wed', eth: 0.45, usd: 900 },
  { day: 'Thu', eth: 1.65, usd: 3300 },
  { day: 'Fri', eth: 1.10, usd: 2200 },
  { day: 'Sat', eth: 0.95, usd: 1900 },
  { day: 'Sun', eth: 1.76, usd: 3520 },
]

export function ActivityChart() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkDark = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'))
      }
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return (
      <div className="h-60 w-full flex items-center justify-center font-mono text-xs text-[var(--muted)] bg-[var(--surface-secondary)] rounded-input">
        INITIALIZING PROTOCOL CHART METRICS...
      </div>
    )
  }

  // Exact Forge / Signal Chart Colors
  const copperColor = isDark ? '#E0785C' : '#B6533C'
  const gridColor = isDark ? '#252F34' : '#EAE6DC'
  const axisColor = isDark ? '#A8B0B2' : '#647078'
  const tooltipBg = isDark ? '#1E262B' : '#FFFFFF'
  const tooltipBorder = isDark ? '#354148' : '#D9D4C9'
  const tooltipText = isDark ? '#E9E7DF' : '#202529'
  const tooltipShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 4px 14px rgba(32, 37, 41, 0.08)'

  return (
    <div className="h-60 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyData} margin={{ left: -20, right: 8, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="copperSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={copperColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={copperColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="2 2" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: axisColor, fontFamily: 'IBM Plex Mono' }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: axisColor, fontFamily: 'IBM Plex Mono' }}
            domain={[0, 2.0]}
            ticks={[0.0, 0.5, 1.0, 1.5, 2.0]}
          />
          <Tooltip
            formatter={(value: number) => [`${value} ETH (${fmtUsd(value * 2000)})`, 'Volume']}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              boxShadow: tooltipShadow,
              color: tooltipText,
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
              padding: '6px 10px',
            }}
          />
          <Area
            type="monotone"
            dataKey="eth"
            stroke={copperColor}
            strokeWidth={2}
            fill="url(#copperSignal)"
            dot={false}
            activeDot={{ r: 4, fill: copperColor, stroke: tooltipBg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
