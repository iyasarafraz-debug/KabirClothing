import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Check, Package, Truck, Home } from 'lucide-react'
import { formatINR, formatDateTime, parseAddress } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      shipment: true,
    },
  })
  if (!order) notFound()

  return (
    <div className="container-kabir py-12 lg:py-16 max-w-3xl">
      <div className="text-center mb-12">
        <div className="h-16 w-16 rounded-full bg-accent/15 mx-auto flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-accent-foreground" />
        </div>
        <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">
          Order {order.status === 'CONFIRMED' ? 'confirmed' : 'received'}
        </p>
        <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-3">Thank you for your order</h1>
        <p className="text-foreground/70 max-w-md mx-auto">
          We've received your order and will send a confirmation email shortly with tracking details once your parcel ships.
        </p>
      </div>

      <div className="border border-border bg-card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Order number</p>
            <p className="font-serif text-2xl">{order.number}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Placed</p>
            <p className="text-sm">{formatDateTime(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Payment</p>
            <p className="text-sm">{order.payment?.status ?? 'Pending'}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Total</p>
            <p className="font-serif text-xl">{formatINR(order.totalPaise)}</p>
          </div>
        </div>

        {/* Order items */}
        <div className="border-t border-border pt-4">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">Items</p>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                { }
                <img
                  src={item.product.images?.[0]?.url ?? '/placeholder.png'}
                  alt={item.product.name}
                  className="h-16 w-14 object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatINR(item.lineTotalPaise)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="border-t border-border mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Subtotal</span>
            <span>{formatINR(order.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Shipping</span>
            <span>{order.shippingPaise === 0 ? 'Free' : formatINR(order.shippingPaise)}</span>
          </div>
          {order.discountPaise > 0 && (
            <div className="flex justify-between text-accent-foreground">
              <span>Discount</span>
              <span>−{formatINR(order.discountPaise)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg pt-2 border-t border-border mt-2">
            <span className="font-medium">Total</span>
            <span className="font-serif">{formatINR(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="border border-border bg-card p-6 mb-6">
        <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-2">Shipping to</p>
        {(() => {
          const a = parseAddress(order.shippingAddress)
          if (!a) return <p className="text-sm text-foreground/60">Address unavailable</p>
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

      {/* Next steps */}
      <div className="border border-border bg-card p-6 mb-8">
        <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-4">What happens next</p>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-xs font-medium text-accent-foreground">1</span>
            <span>We confirm your order and prepare it for dispatch (typically 1–2 business days).</span>
          </li>
          <li className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-xs font-medium text-accent-foreground">2</span>
            <span className="flex items-center gap-1.5"><Package className="h-4 w-4" /> You'll receive a shipping confirmation with a tracking number.</span>
          </li>
          <li className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-accent/15 flex items-center justify-center text-xs font-medium text-accent-foreground">3</span>
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Your parcel arrives in 3–7 business days across India.</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/account/orders">View order history</Link>
        </Button>
        <Button asChild className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
          <Link href="/shop"><Home className="h-4 w-4 mr-2" /> Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
