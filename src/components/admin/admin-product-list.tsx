'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatINR, formatDate } from '@/lib/format'
import { Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Product = {
  id: string
  slug: string
  name: string
  sku: string
  pricePaise: number
  salePricePaise: number | null
  isActive: boolean
  createdAt: Date
  category: { name: string }
  _count: { variants: number }
}

export function AdminProductList({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
  )

  async function archive(id: string) {
    if (!confirm('Archive this product? It will be hidden from the storefront.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, isActive: false } : p)))
      toast.success('Product archived')
    } catch {
      toast.error('Could not archive')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <Input
          placeholder="Search by name or SKU"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-eyebrow text-foreground/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-foreground/60">{p.sku}</td>
                <td className="px-4 py-3 text-foreground/60">{p.category.name}</td>
                <td className="px-4 py-3">
                  {p.salePricePaise ? (
                    <>
                      <span className="text-destructive line-through mr-2">{formatINR(p.pricePaise)}</span>
                      {formatINR(p.salePricePaise)}
                    </>
                  ) : (
                    formatINR(p.pricePaise)
                  )}
                </td>
                <td className="px-4 py-3">{p._count.variants}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.isActive ? 'default' : 'outline'}>
                    {p.isActive ? 'Active' : 'Archived'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-foreground/60">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                      <Link href={`/admin/products/${p.id}`} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-foreground/60 hover:text-destructive"
                      onClick={() => archive(p.id)}
                      disabled={busy === p.id}
                      aria-label="Archive"
                    >
                      {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
