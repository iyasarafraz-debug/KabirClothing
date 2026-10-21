import { AdminShell } from '@/components/admin/admin-shell'
import { AdminProductForm } from '@/components/admin/admin-product-form'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getCategories() {
  return db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } })
}

export default async function AdminNewProductPage() {
  const categories = await getCategories()
  return (
    <AdminShell title="New product">
      <AdminProductForm categories={categories} />
    </AdminShell>
  )
}
