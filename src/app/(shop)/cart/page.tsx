'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/stores/cart'
import { formatINR } from '@/lib/format'
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CartPage() {
  const { items, isLoading, setLoading, setItems } = useCartStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
    refresh()
     
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.cart?.items ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateQty(itemId: string, qty: number) {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: qty }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not update' }))
        throw new Error(d.error)
      }
      const data = await res.json()
      setItems(data.cart?.items ?? [])
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeItem(itemId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data.cart?.items ?? [])
      toast.success('Removed')
    } catch {
      toast.error('Could not remove')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0)
  const shipping = subtotal === 0 || subtotal >= 150000 ? 0 : 9900
  const total = subtotal + shipping

  if (!hydrated || (isLoading && items.length === 0)) {
    return (
      <div className="container-kabir py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container-kabir py-10 lg:py-16">
      <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-8">Your Bag</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
          <p className="font-serif text-2xl mb-2">Your bag is empty</p>
          <p className="text-sm text-foreground/60 mb-6">Discover our latest essentials and signature pieces.</p>
          <Button asChild className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
            <Link href="/shop">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
          <div>
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.id} className="py-6 flex gap-4">
                  <Link href={`/product/${item.product.slug}`} className="shrink-0">
                    { }
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.images?.[0]?.altText ?? item.product.name}
                      className="h-32 w-28 object-cover bg-muted"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-accent-foreground">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-foreground/60 mt-1">
                      Size {item.variant.size} · {item.variant.color}
                    </p>
                    <p className="text-sm font-medium mt-2">{formatINR(item.unitPricePaise)}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="inline-flex items-center border border-border">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity + 1)} aria-label="Increase">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-foreground/60 hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg">{formatINR(item.unitPricePaise * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button asChild variant="ghost">
                <Link href="/shop">← Continue shopping</Link>
              </Button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 self-start border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
              </div>
              {subtotal > 0 && subtotal < 150000 && (
                <p className="text-xs text-foreground/50 pt-1">
                  Add {formatINR(150000 - subtotal)} more for free shipping
                </p>
              )}
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-lg">
              <span className="font-medium">Total</span>
              <span className="font-serif">{formatINR(total)}</span>
            </div>
            <Button asChild className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
              <Link href="/checkout">Proceed to checkout <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <p className="text-xs text-foreground/50 text-center">
              Inclusive of all taxes. Free returns within 7 days.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
