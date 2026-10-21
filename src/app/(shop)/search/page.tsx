import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Search', description: 'Search the Kabir Clothing collection.' }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const trimmed = (q ?? '').trim()

  if (!trimmed) {
    return (
      <div className="container-kabir py-24 text-center">
        <p className="font-serif text-4xl mb-3">Search Kabir Clothing</p>
        <p className="text-foreground/60">Use the search bar above to find your next favourite piece.</p>
      </div>
    )
  }

  const items = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: trimmed } },
        { shortDescription: { contains: trimmed } },
        { description: { contains: trimmed } },
        { searchMetadata: { contains: trimmed } },
        { sku: { contains: trimmed } },
      ],
    },
    take: 24,
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
  })

  return (
    <div>
      <div className="bg-muted/40 border-b border-border">
        <div className="container-kabir py-8">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-2">Search results</p>
          <h1 className="font-serif text-3xl lg:text-4xl tracking-display">“{trimmed}”</h1>
          <p className="text-sm text-foreground/60 mt-2">{items.length} {items.length === 1 ? 'result' : 'results'} found</p>
        </div>
      </div>
      <ProductGrid initialItems={items as any} initialTotal={items.length} />
    </div>
  )
}
