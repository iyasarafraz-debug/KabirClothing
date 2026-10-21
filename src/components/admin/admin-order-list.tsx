'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatINR, formatDateTime } from '@/lib/format'

type Order = {
  id: string
  number: string
  status: string
  totalPaise: number
  createdAt: string
  user: { email: string; name: string | null } | null
  items: { id: string }[]
  payment: { status: string } | null
}

export function AdminOrderList({ initialOrders }: { initialOrders: Order[] }) {
  return (
    <div className="border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-eyebrow text-foreground/60">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Placed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {initialOrders.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-foreground/60">No orders yet.</td></tr>
          ) : (
            initialOrders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="hover:text-accent-foreground">{o.number}</Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{o.user?.email ?? 'Guest'}</td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3">{formatINR(o.totalPaise)}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{o.payment?.status ?? '—'}</Badge>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{o.status}</Badge></td>
                <td className="px-4 py-3 text-foreground/60">{formatDateTime(o.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
