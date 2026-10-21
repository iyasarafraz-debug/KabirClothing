import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Bestsellers', description: 'The most-loved Kabir Clothing pieces.' }

async function getData() {
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, bestseller: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true, bestseller: true } }),
  ])
  return { items, total }
}

export default async function BestsellersPage() {
  const { items, total } = await getData()
  return <ProductGrid title="Bestsellers" subtitle="Loved by you" bestseller initialItems={items as any} initialTotal={total} />
}
