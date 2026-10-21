import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AccountShell } from '@/components/shop/account-shell'
import { formatINR, formatDateTime, parseAddress } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) notFound()
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      shipment: true,
    },
  })
  if (!order || order.userId !== session.user.id) notFound()

  return (
    <AccountShell title={`Order ${order.number}`}>
      <div className="space-y-6">
        <div className="border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Order number</p>
              <p className="font-serif text-2xl">{order.number}</p>
              <p className="text-xs text-foreground/60 mt-1">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">{order.status}</Badge>
              <p className="font-serif text-xl">{formatINR(order.totalPaise)}</p>
            </div>
          </div>
        </div>

        {order.shipment && (
          <div className="border border-border bg-card p-6">
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-2">Shipment</p>
            {order.shipment.trackingNumber ? (
              <>
                <p className="text-sm">
                  Carrier: <span className="font-medium">{order.shipment.carrier ?? '—'}</span>
                </p>
                <p className="text-sm">
                  Tracking: <span className="font-medium">{order.shipment.trackingNumber}</span>
                </p>
                {order.shipment.trackingUrl && (
                  <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-foreground hover:underline mt-2 inline-block">
                    Track shipment →
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-foreground/60">Your order is being prepared for shipment.</p>
            )}
          </div>
        )}

        <div className="border border-border bg-card p-6">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">Items</p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                <Link href={`/product/${item.product.slug}`}>
                  { }
                  <img src={item.product.images?.[0]?.url ?? '/placeholder.png'} alt={item.productName} className="h-16 w-14 object-cover bg-muted" />
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-accent-foreground">{item.productName}</Link>
                  <p className="text-xs text-foreground/60">{item.size} · {item.color} · Qty {item.quantity}</p>
                </div>
                <p className="font-medium">{formatINR(item.lineTotalPaise)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border bg-card p-6">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-2">Shipping address</p>
          {(() => {
            const a = parseAddress(order.shippingAddress)
            if (!a) return <p className="text-sm text-foreground/60">—</p>
            return (
              <address className="not-italic text-sm leading-relaxed">
                <p className="font-medium">{a.fullName}</p>
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                <p>{a.city}, {a.state} {a.pincode}</p>
                <p>{a.country}</p>
                <p className="mt-2 text-foreground/70">{a.phone}</p>
              </address>
            )
          })()}
        </div>

        <Link href="/account/orders" className="text-sm text-accent-foreground hover:underline">← All orders</Link>
      </div>
    </AccountShell>
  )
}
