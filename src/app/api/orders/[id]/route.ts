/**
 * GET /api/orders/[id] — order detail (owner or admin)
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: {} } } } },
      payment: true,
      shipment: true,
      coupon: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  // Owner or admin only
  if (order.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ order })
}
