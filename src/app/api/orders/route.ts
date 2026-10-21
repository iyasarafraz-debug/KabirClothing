/**
 * GET /api/orders — list current user's orders
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await requireUser()
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
    },
  })
  return NextResponse.json({ orders })
}
