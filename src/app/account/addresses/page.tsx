'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AccountShell } from '@/components/shop/account-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
]

type Address = {
  id: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  isDefault: boolean
}

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullName: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '', country: 'India', isDefault: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/auth/login?callbackUrl=/account/addresses')
    if (status === 'authenticated') refresh()
     
  }, [status])

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch('/api/me/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/me/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not save' }))
        throw new Error(d.error)
      }
      toast.success('Address saved')
      setShowForm(false)
      setForm({ fullName: '', phone: '', line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '', country: 'India', isDefault: false })
      refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this address?')) return
    try {
      await fetch(`/api/me/addresses/${id}`, { method: 'DELETE' })
      toast.success('Removed')
      refresh()
    } catch {
      toast.error('Could not remove')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AccountShell title="Addresses">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
      </AccountShell>
    )
  }

  return (
    <AccountShell title="Addresses">
      <div className="space-y-4">
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-12 border border-dashed border-border">
            <p className="text-sm text-foreground/60 mb-4">No saved addresses yet.</p>
            <Button onClick={() => setShowForm(true)} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
              <Plus className="h-4 w-4 mr-2" /> Add address
            </Button>
          </div>
        ) : (
          <>
            {addresses.map((a) => (
              <div key={a.id} className="border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-medium flex items-center gap-2">
                      {a.fullName}
                      {a.isDefault && <span className="text-[10px] tracking-eyebrow uppercase bg-accent/15 text-accent-foreground px-1.5 py-0.5">Default</span>}
                    </p>
                    <p className="text-foreground/70 mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                    <p className="text-foreground/70">{a.city}, {a.state} {a.pincode}</p>
                    <p className="text-foreground/70">{a.country}</p>
                    <p className="text-foreground/70 mt-1">{a.phone}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(a.id)} aria-label="Remove address">
                    <Trash2 className="h-4 w-4 text-foreground/60 hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {showForm ? (
              <form onSubmit={save} className="border border-border bg-card p-5 space-y-4">
                <p className="font-serif text-lg">New address</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="line1">Address line 1 *</Label>
                  <Input id="line1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="line2">Address line 2</Label>
                  <Input id="line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="mt-1.5" />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select id="state" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN *</Label>
                    <Input id="pincode" required pattern="[0-9]{6}" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1.5" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                  Set as default
                </label>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add another address
              </Button>
            )}
          </>
        )}
      </div>
    </AccountShell>
  )
}
