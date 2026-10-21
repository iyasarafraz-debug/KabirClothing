import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminShell } from '@/components/admin/admin-shell'
import { AdminOrderDetail } from '@/components/admin/admin-order-detail'

export const dynamic = 'force-dynamic'

async function getData(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      shipment: true,
      coupon: true,
    },
  })
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getData(id)
  if (!order) notFound()
  return (
    <AdminShell title={`Order ${order.number}`}>
      <AdminOrderDetail order={order as any} />
    </AdminShell>
  )
}
