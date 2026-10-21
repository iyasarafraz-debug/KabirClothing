import { AdminShell } from '@/components/admin/admin-shell'
import { AdminProductForm } from '@/components/admin/admin-product-form'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function getData(id: string) {
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { position: 'asc' } },
        assets3d: true,
      },
    }),
    db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
  ])
  return { product, categories }
}

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { product, categories } = await getData(id)
  if (!product) notFound()
  return (
    <AdminShell title={`Edit · ${product.name}`}>
      <AdminProductForm product={product as any} categories={categories} />
    </AdminShell>
  )
}
