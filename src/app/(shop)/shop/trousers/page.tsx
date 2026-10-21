import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Trousers & Bottoms', description: 'Straight-fit trousers, cargos, and denim from Kabir Clothing.' }

async function getData() {
  const cat = await db.category.findUnique({ where: { slug: 'trousers' } })
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

export default async function TrousersPage() {
  const { items, total } = await getData()
  return <ProductGrid title="Trousers & Bottoms" subtitle="Straight-fit, cargo, denim" category="trousers" initialItems={items as any} initialTotal={total} />
}
