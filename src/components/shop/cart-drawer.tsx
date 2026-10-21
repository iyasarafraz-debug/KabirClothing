'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { X, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCartStore } from '@/stores/cart'
import { formatINR } from '@/lib/format'
import { toast } from 'sonner'

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { items, isLoading, setLoading, setItems } = useCartStore()

  // Hydrate cart on mount and whenever the drawer opens
  useEffect(() => {
    refreshCart()
     
  }, [])

  useEffect(() => {
    if (open) refreshCart()
     
  }, [open])

  async function refreshCart() {
    setLoading(true)
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.cart?.items ?? [])
      }
    } catch {
      /* silent */
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
        const d = await res.json().catch(() => ({ error: 'Could not update cart' }))
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
      if (!res.ok) throw new Error('Could not remove item')
      const data = await res.json()
      setItems(data.cart?.items ?? [])
      toast.success('Removed from bag')
    } catch {
      toast.error('Could not remove item')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0)
  const freeShippingThreshold = 150000
  const remaining = Math.max(0, freeShippingThreshold - subtotal)
  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-serif text-2xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your Bag
            <span className="text-sm font-sans text-foreground/60">({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </SheetTitle>
        </SheetHeader>

        {isLoading && items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-foreground/30" />
            <div>
              <p className="font-serif text-xl">Your bag is empty</p>
              <p className="text-sm text-foreground/60 mt-1">Discover our latest essentials and signature pieces.</p>
            </div>
            <Button asChild onClick={() => onOpenChange(false)} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-6 py-3 bg-muted/40 border-b border-border">
              {remaining > 0 ? (
                <p className="text-xs text-foreground/70">
                  Add <span className="font-semibold text-foreground">{formatINR(remaining)}</span> more for complimentary shipping
                </p>
              ) : (
                <p className="text-xs text-accent-foreground font-medium">You qualify for complimentary shipping</p>
              )}
              <div className="h-1 bg-border rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Link
                    href={`/product/${item.product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    { }
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.images?.[0]?.altText ?? item.product.name}
                      className="h-24 w-20 object-cover bg-muted"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="text-sm font-medium hover:text-accent-foreground line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-foreground/60 mt-1">
                      {item.variant.size} · {item.variant.color}
                    </p>
                    <p className="text-sm font-medium mt-2">{formatINR(item.unitPricePaise)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2 text-sm min-w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-foreground/60 hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Subtotal</span>
                <span className="font-serif text-xl">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-foreground/50">Shipping & taxes calculated at checkout</p>
              <Button
                asChild
                className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/cart">View full bag</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
