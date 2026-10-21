import { AdminShell } from '@/components/admin/admin-shell'
import { db } from '@/lib/db'
import { CategoryManager } from '@/components/admin/category-manager'

export const dynamic = 'force-dynamic'

async function getData() {
  return db.category.findMany({ include: { parent: true, _count: { select: { products: true } } }, orderBy: { name: 'asc' } })
}

export default async function AdminCategoriesPage() {
  const categories = await getData()
  return (
    <AdminShell title="Categories">
      <CategoryManager initialCategories={categories as any} />
    </AdminShell>
  )
}
