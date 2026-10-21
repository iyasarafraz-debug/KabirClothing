import { AdminShell } from '@/components/admin/admin-shell'
import { db } from '@/lib/db'
import { CouponManager } from '@/components/admin/coupon-manager'

export const dynamic = 'force-dynamic'

async function getData() {
  return db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
}

export default async function AdminCouponsPage() {
  const coupons = await getData()
  return (
    <AdminShell title="Coupons">
      <CouponManager initialCoupons={coupons as any} />
    </AdminShell>
  )
}
