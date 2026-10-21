/**
 * Admin dashboard overview: counts and recent activity.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    lowStockVariants,
    recentOrders,
    paidPayments,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
  ] = await Promise.all([
    db.order.count(),
    db.product.count({ where: { isActive: true } }),
    db.user.count(),
    db.productVariant.findMany({
      where: { stock: { lt: 10 }, isActive: true },
      take: 10,
      include: { product: { select: { name: true, slug: true } } },
    }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { email: true, name: true } }, items: true, payment: true },
    }),
    db.payment.aggregate({ where: { status: PaymentStatus.PAID }, _sum: { amountPaise: true } }),
    db.order.count({ where: { status: OrderStatus.PENDING } }),
    db.order.count({ where: { status: OrderStatus.CONFIRMED } }),
    db.order.count({ where: { status: OrderStatus.SHIPPED } }),
    db.order.count({ where: { status: OrderStatus.DELIVERED } }),
  ])

  return NextResponse.json({
    totals: {
      orders: totalOrders,
      products: totalProducts,
      users: totalUsers,
      revenuePaise: paidPayments._sum.amountPaise ?? 0,
    },
    statusOverview: {
      pending: pendingOrders,
      confirmed: confirmedOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
    },
    lowStock: lowStockVariants,
    recentOrders,
  })
}
