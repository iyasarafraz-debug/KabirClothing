'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatINR, formatDate } from '@/lib/format'
import { rupeesToPaise } from '@/lib/format'

type Coupon = {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minOrderPaise: number
  maxDiscountPaise: number | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
}

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValueRupees: '',
    minOrderRupees: '',
    maxDiscountRupees: '',
    usageLimit: '',
    isActive: true,
  })

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          description: form.description || undefined,
          discountType: form.discountType,
          discountValue: form.discountType === 'PERCENTAGE'
            ? Number(form.discountValueRupees) // percentage value
            : rupeesToPaise(parseFloat(form.discountValueRupees) || 0), // flat paise
          minOrderPaise: form.minOrderRupees ? rupeesToPaise(parseFloat(form.minOrderRupees)) : 0,
          maxDiscountPaise: form.maxDiscountRupees ? rupeesToPaise(parseFloat(form.maxDiscountRupees)) : undefined,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
          isActive: form.isActive,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not create' }))
        throw new Error(d.error)
      }
      const data = await res.json()
      setCoupons((cs) => [data.coupon, ...cs])
      setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValueRupees: '', minOrderRupees: '', maxDiscountRupees: '', usageLimit: '', isActive: true })
      toast.success('Coupon created')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this coupon?')) return
    setBusy(id)
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      setCoupons((cs) => cs.filter((c) => c.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
    } finally {
      setBusy(null)
    }
  }

  async function toggle(coupon: Coupon) {
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      setCoupons((cs) => cs.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c)))
    } catch {
      toast.error('Could not update')
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-eyebrow text-foreground/60">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-foreground/60">No coupons yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.discountType}</td>
                  <td className="px-4 py-3">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatINR(c.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{formatINR(c.minOrderPaise)}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c)}>
                      <Badge variant={c.isActive ? 'default' : 'outline'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/60 hover:text-destructive" disabled={busy === c.id} onClick={() => remove(c.id)}>
                      {busy === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={create} className="border border-border bg-card p-5 space-y-3 self-start">
        <p className="font-serif text-lg">New coupon</p>
        <div>
          <Label htmlFor="code" className="text-xs">Code *</Label>
          <Input id="code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-1 h-9 uppercase" />
        </div>
        <div>
          <Label htmlFor="description" className="text-xs">Description</Label>
          <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-9" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="discountType" className="text-xs">Type</Label>
            <select id="discountType" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as any })} className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat</option>
            </select>
          </div>
          <div>
            <Label htmlFor="discountValue" className="text-xs">{form.discountType === 'PERCENTAGE' ? '% off' : '₹ off'} *</Label>
            <Input id="discountValue" type="number" required value={form.discountValueRupees} onChange={(e) => setForm({ ...form, discountValueRupees: e.target.value })} className="mt-1 h-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="minOrder" className="text-xs">Min ₹</Label>
            <Input id="minOrder" type="number" value={form.minOrderRupees} onChange={(e) => setForm({ ...form, minOrderRupees: e.target.value })} className="mt-1 h-9" />
          </div>
          <div>
            <Label htmlFor="maxDiscount" className="text-xs">Max ₹ (cap)</Label>
            <Input id="maxDiscount" type="number" value={form.maxDiscountRupees} onChange={(e) => setForm({ ...form, maxDiscountRupees: e.target.value })} className="mt-1 h-9" />
          </div>
        </div>
        <div>
          <Label htmlFor="usageLimit" className="text-xs">Usage limit</Label>
          <Input id="usageLimit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="mt-1 h-9" />
        </div>
        <Button type="submit" disabled={saving} className="w-full bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal h-9">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Create coupon
        </Button>
      </form>
    </div>
  )
}
