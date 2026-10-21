import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Shirts', description: 'Oxford, linen, and overshirts from Kabir Clothing.' }

async function getData() {
  const shirts = await db.category.findUnique({ where: { slug: 'shirts' } })
  const overshirts = await db.category.findUnique({ where: { slug: 'overshirts' } })
  const ids = [shirts?.id, overshirts?.id].filter(Boolean) as string[]
  if (ids.length === 0) return { items: [], total: 0 }
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, categoryId: { in: ids } },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true, categoryId: { in: ids } } }),
  ])
  return { items, total }
}

export default async function ShirtsPage() {
  const { items, total } = await getData()
  return <ProductGrid title="Shirts" subtitle="Oxford, linen, and overshirts" category="shirts" initialItems={items as any} initialTotal={total} />
}
