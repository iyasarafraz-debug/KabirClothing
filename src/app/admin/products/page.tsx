import { AdminShell } from '@/components/admin/admin-shell'
import { AdminProductList } from '@/components/admin/admin-product-list'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getData() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, _count: { select: { variants: true } } },
  })
  return products
}

export default async function AdminProductsPage() {
  const products = await getData()
  return (
    <AdminShell title="Products">
      <div className="mb-4 flex justify-end">
        <Button asChild className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
          <Link href="/admin/products/new"><Plus className="h-4 w-4 mr-2" /> New product</Link>
        </Button>
      </div>
      <AdminProductList initialProducts={products as any} />
    </AdminShell>
  )
}
