import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'T-Shirts', description: 'Premium cotton t-shirts from Kabir Clothing.' }

async function getData() {
  const cat = await db.category.findUnique({ where: { slug: 't-shirts' } })
  if (!cat) return { items: [], total: 0 }
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, categoryId: cat.id },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true, categoryId: cat.id } }),
  ])
  return { items, total }
}

export default async function TShirtsPage() {
  const { items, total } = await getData()
  return <ProductGrid title="T-Shirts" subtitle="Heavyweight cotton essentials" category="t-shirts" initialItems={items as any} initialTotal={total} />
}
