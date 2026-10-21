'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatINR, formatDateTime, parseAddress } from '@/lib/format'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { OrderStatus } from '@prisma/client'

type Order = {
  id: string
  number: string
  status: string
  subtotalPaise: number
  shippingPaise: number
  discountPaise: number
  totalPaise: number
  notes: string | null
  shippingAddress: string
  createdAt: string
  user: { email: string; name: string | null } | null
  items: {
    id: string
    productName: string
    size: string
    color: string
    quantity: number
    unitPricePaise: number
    lineTotalPaise: number
    product: { slug: string; images: { url: string }[] }
  }[]
  payment: { status: string; provider: string; providerPaymentId: string | null; method: string | null; amountPaise: number } | null
  shipment: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null; status: string } | null
  coupon: { code: string; discountType: string; discountValue: number } | null
}

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'FAILED']

export function AdminOrderDetail({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState(initialOrder)
  const [saving, setSaving] = useState(false)
  const [carrier, setCarrier] = useState(initialOrder.shipment?.carrier ?? '')
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.shipment?.trackingNumber ?? '')
  const [trackingUrl, setTrackingUrl] = useState(initialOrder.shipment?.trackingUrl ?? '')

  async function updateStatus(status: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOrder(data.order)
      toast.success(`Order marked as ${status}`)
    } catch {
      toast.error('Could not update status')
    } finally {
      setSaving(false)
    }
  }

  async function saveShipment() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier, trackingNumber, trackingUrl }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOrder(data.order)
      toast.success('Shipment details saved')
    } catch {
      toast.error('Could not save shipment')
    } finally {
      setSaving(false)
    }
  }

  const address = parseAddress(order.shippingAddress) ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="border border-border bg-card p-4">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Order</p>
          <p className="font-serif text-lg">{order.number}</p>
          <p className="text-xs text-foreground/60 mt-1">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="border border-border bg-card p-4">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Customer</p>
          <p className="text-sm font-medium">{order.user?.email ?? 'Guest'}</p>
          {order.user?.name && <p className="text-xs text-foreground/60">{order.user.name}</p>}
        </div>
        <div className="border border-border bg-card p-4">
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Total</p>
          <p className="font-serif text-lg">{formatINR(order.totalPaise)}</p>
          <Badge variant="outline" className="mt-1">{order.status}</Badge>
        </div>
      </div>

      {/* Status management */}
      <div className="border border-border bg-card p-5">
        <p className="font-serif text-lg mb-3">Order status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={order.status === s ? 'default' : 'outline'}
              disabled={saving || order.status === s}
              onClick={() => updateStatus(s)}
              className={order.status === s ? 'bg-kabir-black text-kabir-ivory' : ''}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="border border-border bg-card p-5">
        <p className="font-serif text-lg mb-3">Items</p>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex gap-4 items-center">
              { }
              <img src={item.product.images?.[0]?.url ?? '/placeholder.png'} alt={item.productName} className="h-14 w-12 object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-foreground/60">{item.size} · {item.color} · Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatINR(item.lineTotalPaise)}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-border mt-3 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-foreground/60">Subtotal</span><span>{formatINR(order.subtotalPaise)}</span></div>
          <div className="flex justify-between"><span className="text-foreground/60">Shipping</span><span>{order.shippingPaise === 0 ? 'Free' : formatINR(order.shippingPaise)}</span></div>
          {order.discountPaise > 0 && (
            <div className="flex justify-between text-accent-foreground"><span>Discount {order.coupon ? `(${order.coupon.code})` : ''}</span><span>−{formatINR(order.discountPaise)}</span></div>
          )}
          <div className="flex justify-between text-lg pt-2 border-t border-border mt-2"><span className="font-medium">Total</span><span className="font-serif">{formatINR(order.totalPaise)}</span></div>
        </div>
      </div>

      {/* Shipping */}
      <div className="border border-border bg-card p-5">
        <p className="font-serif text-lg mb-3">Shipping address</p>
        <address className="not-italic text-sm leading-relaxed">
          <p className="font-medium">{address.fullName}</p>
          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          <p>{address.city}, {address.state} {address.pincode}</p>
          <p>{address.country}</p>
          <p className="mt-2 text-foreground/70">{address.phone}</p>
        </address>
      </div>

      {/* Payment */}
      <div className="border border-border bg-card p-5">
        <p className="font-serif text-lg mb-3">Payment</p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Status</p>
            <Badge variant="outline">{order.payment?.status ?? '—'}</Badge>
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Provider</p>
            <p className="capitalize">{order.payment?.provider ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Method</p>
            <p className="capitalize">{order.payment?.method ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Shipment */}
      <div className="border border-border bg-card p-5 space-y-3">
        <p className="font-serif text-lg">Shipment</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="carrier" className="text-xs">Carrier</Label>
            <Input id="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Delhivery, Blue Dart…" className="mt-1 h-9" />
          </div>
          <div>
            <Label htmlFor="trackingNumber" className="text-xs">Tracking number</Label>
            <Input id="trackingNumber" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="mt-1 h-9" />
          </div>
          <div>
            <Label htmlFor="trackingUrl" className="text-xs">Tracking URL</Label>
            <Input id="trackingUrl" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} className="mt-1 h-9" />
          </div>
        </div>
        <Button onClick={saveShipment} disabled={saving} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal h-9">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save shipment
        </Button>
      </div>

      {order.notes && (
        <div className="border border-border bg-card p-5">
          <p className="font-serif text-lg mb-2">Customer notes</p>
          <p className="text-sm text-foreground/70">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
