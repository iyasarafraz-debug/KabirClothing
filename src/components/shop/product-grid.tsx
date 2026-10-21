'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/shop/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SlidersHorizontal } from 'lucide-react'
import { formatINR } from '@/lib/format'

type Product = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  pricePaise: number
  salePricePaise: number | null
  images: { url: string; altText?: string | null }[]
  variants: { size: string; color: string; colorHex?: string | null; stock: number }[]
  assets3d?: { id: string }[]
}

type Props = {
  category?: string
  featured?: boolean
  bestseller?: boolean
  newArrival?: boolean
  title?: string
  subtitle?: string
  initialItems?: Product[]
  initialTotal?: number
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '36']
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'Ivory', hex: '#F5F0E8' },
  { name: 'Stone', hex: '#D8D0C4' },
  { name: 'Charcoal', hex: '#282828' },
  { name: 'Olive', hex: '#6B7252' },
  { name: 'Indigo', hex: '#2B3A55' },
  { name: 'Sand', hex: '#D8D0C4' },
  { name: 'White', hex: '#FFFFFF' },
]

export function ProductGrid({ category, featured, bestseller, newArrival, title, subtitle, initialItems = [], initialTotal = 0 }: Props) {
  const router = useRouter()
  const sp = useSearchParams()

  const [items, setItems] = useState<Product[]>(initialItems)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [sort, setSort] = useState(sp.get('sort') || 'newest')

  const [sizes, setSizes] = useState<string[]>(sp.get('sizes')?.split(',').filter(Boolean) ?? [])
  const [colors, setColors] = useState<string[]>(sp.get('colors')?.split(',').filter(Boolean) ?? [])
  const [minPrice, setMinPrice] = useState(sp.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(sp.get('maxPrice') ?? '')
  const [inStock, setInStock] = useState(sp.get('inStock') === 'true')

  function buildQuery(p: number) {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (featured) params.set('featured', 'true')
    if (bestseller) params.set('bestseller', 'true')
    if (newArrival) params.set('newArrival', 'true')
    if (sizes.length) params.set('sizes', sizes.join(','))
    if (colors.length) params.set('colors', colors.join(','))
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (inStock) params.set('inStock', 'true')
    params.set('sort', sort)
    params.set('page', String(p))
    params.set('pageSize', String(pageSize))
    return params.toString()
  }

  async function fetchPage(p: number, replace = true) {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?${buildQuery(p)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setItems(replace ? data.items : [...items, ...data.items])
      setTotal(data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(1)
     
  }, [category, featured, bestseller, newArrival, sort, sizes, colors, minPrice, maxPrice, inStock])

  function toggle(arr: string[], setArr: (v: string[]) => void, value: string) {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
  }

  const FiltersContent = (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(sizes, setSizes, s)}
              className={`h-10 min-w-10 px-3 text-xs border transition-colors ${
                sizes.includes(s) ? 'border-kabir-black bg-kabir-black text-kabir-ivory' : 'border-border hover:border-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">Colour</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggle(colors, setColors, c.name)}
              className={`flex items-center gap-2 text-xs ${colors.includes(c.name) ? 'text-foreground' : 'text-foreground/60'}`}
              aria-pressed={colors.includes(c.name)}
            >
              <span
                className={`h-6 w-6 rounded-full border-2 ${colors.includes(c.name) ? 'border-accent' : 'border-border'}`}
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">Price</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-10 w-full border border-border px-3 text-sm focus:outline-none focus:border-accent"
          />
          <span className="text-foreground/40">—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 w-full border border-border px-3 text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="h-4 w-4 accent-kabir-black"
          />
          In stock only
        </label>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setSizes([])
          setColors([])
          setMinPrice('')
          setMaxPrice('')
          setInStock(false)
        }}
      >
        Clear filters
      </Button>
    </div>
  )

  const hasMore = items.length < total

  return (
    <div className="container-kabir py-10 lg:py-16">
      <div className="mb-10">
        {subtitle && <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">{subtitle}</p>}
        {title && <h1 className="font-serif text-4xl lg:text-5xl tracking-display">{title}</h1>}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        {/* Desktop filters */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <p className="text-sm font-medium mb-6">Filters</p>
          {FiltersContent}
        </aside>

        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">{FiltersContent}</div>
                </SheetContent>
              </Sheet>
              <p className="text-sm text-foreground/60">{total} {total === 1 ? 'item' : 'items'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 hidden sm:inline">Sort by</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          {loading && items.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl mb-2">No products found</p>
              <p className="text-sm text-foreground/60">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" onClick={() => fetchPage(page + 1, false)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
