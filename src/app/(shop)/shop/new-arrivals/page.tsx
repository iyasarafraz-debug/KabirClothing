import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'New Arrivals', description: 'The latest additions to the Kabir Clothing wardrobe.' }

async function getData() {
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, newArrival: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true, newArrival: true } }),
  ])
  return { items, total }
}

export default async function NewArrivalsPage() {
  const { items, total } = await getData()
  return <ProductGrid title="New Arrivals" subtitle="Just landed" newArrival initialItems={items as any} initialTotal={total} />
}
