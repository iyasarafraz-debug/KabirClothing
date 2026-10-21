import { db } from '@/lib/db'
import { ProductGrid } from '@/components/shop/product-grid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse the complete Kabir Clothing collection — tees, shirts, hoodies, trousers, and overshirts.',
}

async function getData() {
  const [items, total] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.count({ where: { isActive: true } }),
  ])
  return { items, total }
}

export default async function ShopAllPage() {
  const { items, total } = await getData()
  return (
    <ProductGrid
      title="Shop All"
      subtitle="The complete collection"
      initialItems={items as any}
      initialTotal={total}
    />
  )
}
