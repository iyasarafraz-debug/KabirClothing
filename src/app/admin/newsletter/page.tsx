import { AdminShell } from '@/components/admin/admin-shell'
import { db } from '@/lib/db'
import { formatDateTime } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

async function getData() {
  return db.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } })
}

export default async function AdminNewsletterPage() {
  const subscribers = await getData()
  return (
    <AdminShell title="Newsletter">
      <div className="mb-4">
        <p className="text-sm text-foreground/60">
          {subscribers.length} total subscribers · {subscribers.filter((s) => s.isActive).length} active
        </p>
      </div>
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-eyebrow text-foreground/60">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subscribers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-foreground/60">No subscribers yet.</td></tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3 text-foreground/60">{s.name ?? '—'}</td>
                  <td className="px-4 py-3 text-foreground/60">{s.source}</td>
                  <td className="px-4 py-3"><Badge variant={s.isActive ? 'default' : 'outline'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-foreground/60">{formatDateTime(s.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
