'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useCartStore } from '@/stores/cart'
import { formatINR } from '@/lib/format'
import { Loader2, Lock, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, isLoading, setLoading, setItems } = useCartStore()
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discountPaise, setDiscountPaise] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    notes: '',
  })

  useEffect(() => {
    setHydrated(true)
    refreshCart()
     
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      setForm((f) => ({ ...f, email: session.user.email ?? '' }))
    }
  }, [session])

  async function refreshCart() {
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

  const subtotal = items.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0)
  const shipping = subtotal === 0 || subtotal >= 150000 ? 0 : 9900
  const total = Math.max(0, subtotal + shipping - discountPaise)

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponError('')
    try {
      // We validate via the checkout endpoint indirectly — but for the preview
      // here, we re-fetch the coupon validity through a lightweight call.
      // The server will re-validate authoritatively on submit.
      // For preview we just trust user input shape; server does the real check.
      setAppliedCoupon('')
      setDiscountPaise(0)
      // Quick check by listing — server-authoritative version runs on checkout
      // We don't have a public preview endpoint; we just store the code and let
      // the checkout endpoint validate it.
      setAppliedCoupon(couponCode.trim().toUpperCase())
      toast.info(`Coupon "${couponCode.trim().toUpperCase()}" will be validated at checkout`)
    } catch (err: any) {
      setCouponError(err.message)
    }
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your bag is empty')
      return
    }
    setSubmitting(true)
    try {
      const idempotencyKey = `chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: 'client',
          email: form.email || undefined,
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country,
          },
          billingAddressSame: true,
          couponCode: appliedCoupon || undefined,
          notes: form.notes || undefined,
          idempotencyKey,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Checkout failed' }))
        throw new Error(d.error)
      }
      const data = await res.json()

      // If Razorpay is configured, redirect to the verify flow.
      // Otherwise, simulate a successful test payment.
      if (data.payment?.gatewayReady) {
        // Open Razorpay checkout — needs the Razorpay script.
        // For demo we just go to confirmation page; production wires up the SDK.
        toast.info('Razorpay checkout would open here in production. Test-mode order created.')
        router.push(`/order-confirmation/${data.orderId}`)
      } else {
        // Test-mode flow: no real gateway, mark as confirmed.
        // For demonstration we treat the order as confirmed directly.
        toast.success('Order placed (test mode)')
        router.push(`/order-confirmation/${data.orderId}`)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || (isLoading && items.length === 0)) {
    return (
      <div className="container-kabir py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-kabir py-20 text-center">
        <p className="font-serif text-3xl mb-2">Your bag is empty</p>
        <p className="text-foreground/60 mb-6">Add items to your bag before checking out.</p>
        <Button asChild className="bg-kabir-black text-kabir-ivory">
          <a href="/shop">Browse products</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container-kabir py-10 lg:py-16">
      <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-8">Checkout</h1>

      <form onSubmit={submitOrder} className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
        {/* Form fields */}
        <div className="space-y-8">
          {/* Contact */}
          <fieldset className="space-y-4">
            <legend className="font-serif text-xl mb-2">Contact</legend>
            {!session && (
              <div>
                <Label htmlFor="email">Email address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
                <p className="text-xs text-foreground/50 mt-1">Order confirmation will be sent here.</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full name *</Label>
                <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="mt-1.5" />
              </div>
            </div>
          </fieldset>

          {/* Shipping address */}
          <fieldset className="space-y-4">
            <legend className="font-serif text-xl mb-2">Shipping address</legend>
            <div>
              <Label htmlFor="line1">Address line 1 *</Label>
              <Input id="line1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House/Flat, Building, Street" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="line2">Address line 2</Label>
              <Input id="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Area, Landmark (optional)" className="mt-1.5" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  id="state"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="pincode">PIN code *</Label>
                <Input id="pincode" required pattern="[0-9]{6}" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="400001" className="mt-1.5" />
              </div>
            </div>
          </fieldset>

          {/* Notes */}
          <fieldset>
            <Label htmlFor="notes">Order notes (optional)</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Delivery instructions, gift message, etc."
              className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </fieldset>

          {/* Payment */}
          <fieldset className="space-y-3">
            <legend className="font-serif text-xl mb-2">Payment</legend>
            <div className="border border-border p-4 bg-muted/30">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-accent-foreground" /> Razorpay (test mode)
              </p>
              <p className="text-xs text-foreground/60 mt-1">
                Payments are processed securely through Razorpay. Card details never touch our servers.
                In test mode, no real charge is made.
              </p>
            </div>
            <p className="text-xs text-foreground/50">
              Test cards: <code className="bg-muted px-1.5 py-0.5 rounded">4111 1111 1111 1111</code> ·
              Use any future expiry and any CVV.
            </p>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 self-start border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-2xl">Your order</h2>

          <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                { }
                <img src={item.product.images?.[0]?.url} alt={item.product.name} className="h-14 w-12 object-cover bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-foreground/60">{item.variant.size} · {item.variant.color} · Qty {item.quantity}</p>
                </div>
                <p className="font-medium">{formatINR(item.unitPricePaise * item.quantity)}</p>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-9"
              />
              <Button type="button" variant="outline" size="sm" onClick={applyCoupon}>Apply</Button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-accent-foreground flex items-center gap-1">
                <Check className="h-3 w-3" /> Coupon {appliedCoupon} will be applied at checkout
              </p>
            )}
            {couponError && <p className="text-xs text-destructive">{couponError}</p>}
            <p className="text-[11px] text-foreground/50">Try WELCOME10 or FLAT200</p>
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            {discountPaise > 0 && (
              <div className="flex justify-between text-accent-foreground">
                <span>Discount</span>
                <span>−{formatINR(discountPaise)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 flex justify-between text-lg">
            <span className="font-medium">Total</span>
            <span className="font-serif">{formatINR(total)}</span>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing order…</>
            ) : (
              <><Lock className="h-4 w-4 mr-2" /> Place order</>
            )}
          </Button>

          <p className="text-[11px] text-foreground/50 text-center">
            By placing your order you agree to our Terms and Privacy Policy.
          </p>
        </aside>
      </form>
    </div>
  )
}
