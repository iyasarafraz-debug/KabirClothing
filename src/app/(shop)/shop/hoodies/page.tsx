import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Hoodies & Sweatshirts', description: 'Heavyweight hoodies and crewnecks from Kabir Clothing.' }

async function getData() {
  const cat = await db.category.findUnique({ where: { slug: 'hoodies' } })
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

export default async function HoodiesPage() {
  const { items, total } = await getData()
  return <ProductGrid title="Hoodies & Sweatshirts" subtitle="Heavyweight fleece" category="hoodies" initialItems={items as any} initialTotal={total} />
}
