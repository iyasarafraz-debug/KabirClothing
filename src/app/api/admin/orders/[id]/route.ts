import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().max(80).optional(),
  carrier: z.string().max(80).optional(),
  trackingUrl: z.string().url().or(z.literal('')).optional(),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
      shipment: true,
      coupon: true,
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const order = await db.order.findUnique({ where: { id }, include: { shipment: true } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (parsed.data.status) {
    await db.order.update({ where: { id }, data: { status: parsed.data.status } })
    if (parsed.data.status === OrderStatus.SHIPPED) {
      if (order.shipment) {
        await db.shipment.update({
          where: { orderId: order.id },
          data: {
            carrier: parsed.data.carrier ?? undefined,
            trackingNumber: parsed.data.trackingNumber ?? undefined,
            trackingUrl: parsed.data.trackingUrl ?? undefined,
            shippedAt: new Date(),
            status: 'SHIPPED',
          },
        })
      } else {
        await db.shipment.create({
          data: {
            orderId: order.id,
            carrier: parsed.data.carrier,
            trackingNumber: parsed.data.trackingNumber,
            trackingUrl: parsed.data.trackingUrl,
            shippedAt: new Date(),
            status: 'SHIPPED',
          },
        })
      }
    } else if (parsed.data.status === OrderStatus.DELIVERED) {
      await db.shipment.upsert({
        where: { orderId: order.id },
        update: { deliveredAt: new Date(), status: 'DELIVERED' },
        create: { orderId: order.id, deliveredAt: new Date(), status: 'DELIVERED' },
      })
    }
  } else {
    // Just updating shipment info
    if (order.shipment) {
      await db.shipment.update({
        where: { orderId: order.id },
        data: {
          carrier: parsed.data.carrier ?? undefined,
          trackingNumber: parsed.data.trackingNumber ?? undefined,
          trackingUrl: parsed.data.trackingUrl ?? undefined,
        },
      })
    } else {
      await db.shipment.create({
        data: {
          orderId: order.id,
          carrier: parsed.data.carrier,
          trackingNumber: parsed.data.trackingNumber,
          trackingUrl: parsed.data.trackingUrl,
        },
      })
    }
  }

  const refreshed = await db.order.findUnique({
    where: { id },
    include: { items: true, payment: true, shipment: true, user: true },
  })
  return NextResponse.json({ order: refreshed })
}
