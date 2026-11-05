"use client"

import { ArrowDownLeft, CheckCheck, CheckCircle2, Trash2, XCircle } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { EmptyState, PageHeader } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'
import { cn, fmtDateTime } from '@/utils/format'

const kinds = {
  incoming: { icon: ArrowDownLeft, bg: 'bg-sage' },
  confirmed: { icon: CheckCircle2, bg: 'bg-sage-soft' },
  failed: { icon: XCircle, bg: 'bg-danger-soft' },
}

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, deleteNotification, toast } = useAppStore()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <AppShell>
      <div>
        <PageHeader
          title="Notifications"
          description={`${unread} unread notifications`}
          action={
            <Button
              variant="ghost"
              size="sm"
              disabled={!unread}
              onClick={() => {
                markAllRead()
                toast('All marked as read')
              }}
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          }
        />
        {notifications.length === 0 ? (
          <EmptyState title="You're all caught up" body="No notifications to show." />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const { icon: Icon, bg } = kinds[n.kind]
              return (
                <Card
                  key={n.id}
                  className={cn('flex items-start gap-4 p-4 sm:p-5', !n.read && 'border-sage')}
                >
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full',
                      bg,
                      n.kind === 'failed' && 'text-danger'
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{n.title}</p>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-sage-deep" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>
                    <p className="mt-1.5 text-xs text-ink-soft">{fmtDateTime(n.date)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                    <button
                      aria-label="Delete notification"
                      onClick={() => {
                        deleteNotification(n.id)
                        toast('Notification deleted', 'info')
                      }}
                      className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger transition"
                    >
                      <Trash2 className="size-4" />
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
