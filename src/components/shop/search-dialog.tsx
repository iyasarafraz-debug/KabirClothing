'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatINR } from '@/lib/format'

type Hit = {
  id: string
  slug: string
  name: string
  pricePaise: number
  salePricePaise: number | null
  images: { url: string; altText?: string | null }[]
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) {
      setHits([])
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&pageSize=6`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setHits(data.items ?? [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    onOpenChange(false)
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="sr-only">Search products</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="px-6 pb-4 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for tees, shirts, hoodies…"
              className="pl-8 border-0 border-b border-border rounded-none text-lg focus-visible:ring-0 focus-visible:border-accent"
            />
          </div>
        </form>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="px-6 py-8 flex items-center justify-center gap-2 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}
          {!loading && q.trim() && hits.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-foreground/60">
              No matches for “{q}”. Try a different term.
            </div>
          )}
          {!loading && hits.length > 0 && (
            <ul className="divide-y divide-border">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={`/product/${hit.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50"
                  >
                    { }
                    <img
                      src={hit.images?.[0]?.url}
                      alt={hit.images?.[0]?.altText ?? hit.name}
                      className="h-14 w-12 object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{hit.name}</p>
                      <p className="text-sm text-foreground/60">
                        {hit.salePricePaise ? (
                          <>
                            <span className="text-destructive line-through mr-2">{formatINR(hit.pricePaise)}</span>
                            {formatINR(hit.salePricePaise)}
                          </>
                        ) : (
                          formatINR(hit.pricePaise)
                        )}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false)
                    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
                  }}
                  className="w-full text-left px-6 py-3 text-sm text-accent-foreground hover:bg-muted/50"
                >
                  See all results for “{q}” →
                </button>
              </li>
            </ul>
          )}
          {!q.trim() && (
            <div className="px-6 py-6">
              <p className="text-xs text-foreground/50 mb-3 uppercase tracking-eyebrow">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {['Oversized tee', 'Hoodie', 'Linen shirt', 'Cargo pants', 'Denim'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
