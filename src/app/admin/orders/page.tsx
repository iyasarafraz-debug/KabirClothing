import { AdminShell } from '@/components/admin/admin-shell'
import { AdminOrderList } from '@/components/admin/admin-order-list'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getData() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
      items: true,
      payment: true,
    },
  })
  return orders
}

export default async function AdminOrdersPage() {
  const orders = await getData()
  return (
    <AdminShell title="Orders">
      <AdminOrderList initialOrders={orders as any} />
    </AdminShell>
  )
}
