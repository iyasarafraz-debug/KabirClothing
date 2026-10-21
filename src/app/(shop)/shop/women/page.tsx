import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = { title: "Women's Collection", description: "Elevated everyday womenswear from Kabir Clothing." }

async function getData() {
  const women = await db.category.findUnique({ where: { slug: 'women' } })
  if (!women) return { items: [], total: 0 }
  const childCats = await db.category.findMany({ where: { parentId: women.id }, select: { id: true } })
  const categoryIds = [women.id, ...childCats.map((c) => c.id)]
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

export default async function WomenPage() {
  const { items, total } = await getData()
  return (
    <>
      {items.length === 0 ? (
        <div className="container-kabir py-24 text-center">
          <p className="font-serif text-3xl mb-3">Coming soon</p>
          <p className="text-foreground/60">Our women's collection is in development. Sign up for the newsletter to be the first to know.</p>
        </div>
      ) : (
        <ProductGrid title="Women's Collection" subtitle="Elevated everyday" category="women" initialItems={items as any} initialTotal={total} />
      )}
    </>
  )
}
