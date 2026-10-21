import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AccountShell } from '@/components/shop/account-shell'
import { formatINR, formatDateTime } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/account/orders')
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { include: { images: { take: 1 } } } } }, payment: true },
  })

  return (
    <AccountShell title="Order History">
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-2xl mb-2">No orders yet</p>
          <p className="text-sm text-foreground/60 mb-6">When you place your first order, it will appear here.</p>
          <Link href="/shop" className="inline-flex items-center px-6 py-3 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-border bg-card">
              <div className="p-4 flex flex-wrap items-start justify-between gap-3 border-b border-border">
                <div>
                  <p className="font-serif text-lg">{order.number}</p>
                  <p className="text-xs text-foreground/60">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{order.status}</Badge>
                  <p className="font-medium">{formatINR(order.totalPaise)}</p>
                </div>
              </div>
              <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar">
                {order.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.product.slug}`}
                    className="shrink-0 flex items-center gap-3 hover:bg-muted/40 p-2 -m-2"
                  >
                    { }
                    <img src={item.product.images?.[0]?.url ?? '/placeholder.png'} alt={item.productName} className="h-16 w-14 object-cover bg-muted" />
                    <div className="text-xs">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-foreground/60">{item.size} · {item.color}</p>
                      <p>Qty {item.quantity}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-4 pt-0">
                <Link href={`/account/orders/${order.id}`} className="text-sm text-accent-foreground hover:underline">
                  View details →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  )
}
