import { AdminShell } from '@/components/admin/admin-shell'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { MessageActions } from '@/components/admin/message-actions'

export const dynamic = 'force-dynamic'

async function getData() {
  return db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  })
}

export default async function AdminMessagesPage() {
  const messages = await getData()
  return (
    <AdminShell title="Messages">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-foreground/60 py-8 text-center">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium">{m.name} <span className="text-foreground/50 text-sm">· {m.email}</span></p>
                  <p className="text-xs text-foreground/60">{formatDateTime(m.createdAt)} · {m.user ? 'Registered' : 'Guest'}</p>
                </div>
                <Badge variant="outline">{m.status}</Badge>
              </div>
              <p className="text-sm font-medium mb-1">{m.subject}</p>
              <p className="text-sm text-foreground/70 whitespace-pre-line">{m.message}</p>
              <MessageActions id={m.id} initialStatus={m.status} />
            </div>
          ))
        )}
      </div>
    </AdminShell>
  )
}
