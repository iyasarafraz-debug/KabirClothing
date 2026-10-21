'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatINR, formatDateTime } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from 'lucide-react'

type Overview = {
  totals: { orders: number; products: number; users: number; revenuePaise: number }
  statusOverview: { pending: number; confirmed: number; shipped: number; delivered: number }
  lowStock: { id: string; size: string; color: string; stock: number; product: { name: string; slug: string } }[]
  recentOrders: {
    id: string
    number: string
    status: string
    totalPaise: number
    createdAt: string
    user: { email: string; name: string | null } | null
  }[]
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminShell title="Overview">
      {loading || !data ? (
        <div className="grid lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={ShoppingCart}
              label="Total orders"
              value={String(data.totals.orders)}
            />
            <StatCard
              icon={IndianRupee}
              label="Revenue (paid)"
              value={formatINR(data.totals.revenuePaise)}
            />
            <StatCard
              icon={Package}
              label="Active products"
              value={String(data.totals.products)}
            />
            <StatCard
              icon={Users}
              label="Customers"
              value={String(data.totals.users)}
            />
          </div>

          {/* Status overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">Order status overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusBox label="Pending" value={data.statusOverview.pending} />
                <StatusBox label="Confirmed" value={data.statusOverview.confirmed} />
                <StatusBox label="Shipped" value={data.statusOverview.shipped} />
                <StatusBox label="Delivered" value={data.statusOverview.delivered} />
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent orders</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentOrders.length === 0 ? (
                  <p className="text-sm text-foreground/60">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentOrders.map((o) => (
                      <li key={o.id} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-accent-foreground truncate block">
                            {o.number}
                          </Link>
                          <p className="text-xs text-foreground/60">
                            {o.user?.email ?? 'Guest'} · {formatDateTime(o.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{o.status}</Badge>
                          <p className="font-medium whitespace-nowrap">{formatINR(o.totalPaise)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Low stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Low stock alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.lowStock.length === 0 ? (
                  <p className="text-sm text-foreground/60">All variants well-stocked.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.lowStock.map((v) => (
                      <li key={v.id} className="py-2 flex items-center justify-between">
                        <Link href={`/admin/products`} className="text-sm hover:text-accent-foreground">
                          {v.product.name} — {v.size}/{v.color}
                        </Link>
                        <Badge variant={v.stock === 0 ? 'destructive' : 'outline'}>
                          {v.stock} left
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs tracking-wide text-foreground/60 uppercase">{label}</p>
          <Icon className="h-4 w-4 text-foreground/40" />
        </div>
        <p className="font-serif text-2xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function StatusBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-4 border border-border">
      <p className="font-serif text-3xl">{value}</p>
      <p className="text-xs text-foreground/60 mt-1">{label}</p>
    </div>
  )
}
