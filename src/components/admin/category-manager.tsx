'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { slugify } from '@/lib/format'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  parent: { name: string } | null
  _count: { products: number }
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not create' }))
        throw new Error(d.error)
      }
      const data = await res.json()
      setCategories((cs) => [...cs, { ...data.category, parent: null, _count: { products: 0 } }])
      setForm({ name: '', slug: '', description: '' })
      toast.success('Category created')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this category? Existing products will keep their category reference.')) return
    setBusy(id)
    try {
      await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      setCategories((cs) => cs.filter((c) => c.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-eyebrow text-foreground/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-foreground/60 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-foreground/60">{c.parent?.name ?? '—'}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/60 hover:text-destructive" disabled={busy === c.id} onClick={() => remove(c.id)}>
                    {busy === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={create} className="border border-border bg-card p-5 space-y-3 self-start">
        <p className="font-serif text-lg">New category</p>
        <div>
          <Label htmlFor="name" className="text-xs">Name *</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 h-9" />
        </div>
        <div>
          <Label htmlFor="slug" className="text-xs">Slug</Label>
          <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto" className="mt-1 h-9" />
        </div>
        <div>
          <Label htmlFor="description" className="text-xs">Description</Label>
          <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 h-9" />
        </div>
        <Button type="submit" disabled={saving} className="w-full bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal h-9">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Add category
        </Button>
      </form>
    </div>
  )
}
