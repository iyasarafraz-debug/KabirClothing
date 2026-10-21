/**
 * Admin orders list + status update.
 * GET  /api/admin/orders
 * PATCH is on /api/admin/orders/[id]
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  await requireAdmin()
  const url = new URL(req.url)
  const status = url.searchParams.get('status') || undefined
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize = Math.min(48, Math.max(1, parseInt(url.searchParams.get('pageSize') || '24', 10)))

  const where = status && status !== 'all' ? { status: status as any } : {}
  const [total, items] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: true,
        payment: true,
        shipment: true,
      },
    }),
  ])
  return NextResponse.json({ items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) })
}
