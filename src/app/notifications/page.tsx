"use client"

import { useState } from 'react'
import {
  ArrowDownLeft,
  CheckCircle2,
  Trash2,
  XCircle,
  Shield,
  Laptop,
  KeyRound,
  CheckCheck,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { EmptyState, PageHeader, DemoNotice } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn, fmtDateTime } from '@/utils/format'

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, deleteNotification, toast } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayed = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const getNotificationIcon = (title: string, kind: string) => {
    const t = title.toLowerCase()
    if (t.includes('received') || t.includes('incoming')) {
      return ArrowDownLeft
    }
    if (t.includes('device') || t.includes('login')) {
      return Laptop
    }
    if (t.includes('identity') || t.includes('key')) {
      return KeyRound
    }
    if (kind === 'failed') {
      return XCircle
    }
    return CheckCircle2
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Real-time cryptographic derivations and settlement feed."
          action={
            unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9 border border-border hover:bg-surface-secondary text-foreground"
                onClick={() => {
                  markAllRead()
                  toast('All notifications marked as read')
                }}
              >
                <CheckCheck className="size-3.5 text-accent" /> Mark all read
              </Button>
            )
          }
        />

        <DemoNotice />

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-control px-4 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer border',
              filter === 'all'
                ? 'bg-foreground text-background border-foreground'
                : 'border-border bg-surface text-muted hover:text-foreground hover:bg-surface-secondary'
            )}
          >
            All Notifications
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'rounded-control px-4 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer border flex items-center gap-1.5',
              filter === 'unread'
                ? 'bg-foreground text-background border-foreground'
                : 'border-border bg-surface text-muted hover:text-foreground hover:bg-surface-secondary'
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-bold font-mono',
                filter === 'unread' ? 'bg-primary text-white' : 'bg-primary-soft text-primary'
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {displayed.length === 0 ? (
          <EmptyState
            title="Telemetry cleared"
            body={filter === 'unread' ? 'No unread notifications.' : 'No protocol activity in your feed.'}
          />
        ) : (
          <div className="space-y-3">
            {displayed.map((n) => {
              const Icon = getNotificationIcon(n.title, n.kind)
              return (
                <Card
                  key={n.id}
                  className={cn(
                    'flex items-center justify-between gap-4 p-4 sm:p-5 transition-all',
                    !n.read
                      ? 'border-border-strong bg-surface shadow-sm'
                      : 'border-border bg-surface/70'
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-control border text-sm',
                      !n.read
                        ? 'bg-primary-soft border-primary/25 text-primary'
                        : 'bg-surface-secondary border-border text-muted'
                    )}>
                      <Icon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm font-semibold text-foreground tracking-tight truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="size-2 rounded-full bg-primary" title="Unread notification" />
                        )}
                      </div>
                      <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                  </div>

                  {/* Right side: Timestamp and Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[11px] text-muted whitespace-nowrap">
                      {fmtDateTime(n.date)}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="font-mono text-[11px] font-medium text-primary hover:text-primary-hover hover:underline hidden sm:inline cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      aria-label="Delete notification"
                      onClick={() => {
                        deleteNotification(n.id)
                        toast('Notification removed', 'info')
                      }}
                      className="grid size-8 place-items-center rounded-control text-muted hover:bg-surface-secondary hover:text-state-error transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
