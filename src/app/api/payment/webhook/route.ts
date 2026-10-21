/**
 * POST /api/payment/webhook
 *
 * Razorpay webhook receiver. Verifies signature, then updates
 * payment + order status. Idempotent.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyWebhookSignature } from '@/lib/payment'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  if (!verifyWebhookSignature({ body: raw, signature })) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  const event = JSON.parse(raw)
  const paymentEntity = event?.payload?.payment?.entity
  if (!paymentEntity) {
    return NextResponse.json({ ok: true })
  }

  // Find our order by provider_order_id
  const payment = await db.payment.findFirst({
    where: { providerOrderId: paymentEntity.order_id },
  })
  if (!payment) return NextResponse.json({ ok: true })

  await db.$transaction(async (tx) => {
    if (payment.status === PaymentStatus.PAID) return
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: paymentEntity.id,
        method: paymentEntity.method,
        rawResponse: raw,
        verifiedAt: new Date(),
      },
    })
    const order = await tx.order.findUnique({ where: { id: payment.orderId } })
    if (order && order.status === OrderStatus.PENDING) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
