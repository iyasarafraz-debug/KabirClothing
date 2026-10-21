import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: "Men's Collection", description: "Contemporary menswear from Kabir Clothing." }

async function getData() {
  const men = await db.category.findUnique({ where: { slug: 'men' } })
  if (!men) return { items: [], total: 0 }
  // Includes the parent Men category and all its child categories
  const childCats = await db.category.findMany({ where: { parentId: men.id }, select: { id: true } })
  const categoryIds = [men.id, ...childCats.map((c) => c.id)]
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, categoryId: { in: categoryIds } },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true, categoryId: { in: categoryIds } } }),
  ])
  return { items, total }
}

export default async function MenPage() {
  const { items, total } = await getData()
  return <ProductGrid title="Men's Collection" subtitle="Contemporary menswear" category="men" initialItems={items as any} initialTotal={total} />
}
