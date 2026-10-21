/**
 * POST /api/payment/razorpay/verify
 *
 * Verifies the payment signature returned by Razorpay checkout.
 * NEVER trusts client-side success message.
 *
 * On success:
 *   - marks payment PAID
 *   - marks order CONFIRMED
 *   - increments coupon usage
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPaymentSignature } from '@/lib/payment'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderId: z.string().min(1),         // Our internal order id
  providerOrderId: z.string().min(1), // Razorpay order id
  paymentId: z.string().min(1),
  signature: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const valid = verifyPaymentSignature({
    orderId: parsed.data.providerOrderId,
    paymentId: parsed.data.paymentId,
    signature: parsed.data.signature,
  })
  if (!valid) {
    // Mark payment FAILED
    const payment = await db.payment.findUnique({ where: { orderId: parsed.data.orderId } })
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          providerPaymentId: parsed.data.paymentId,
          rawResponse: JSON.stringify({ signature: parsed.data.signature }),
        },
      })
    }
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // Success — transactional update
  await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { orderId: parsed.data.orderId } })
    if (!payment) throw new Error('PAYMENT_NOT_FOUND')
    if (payment.status === PaymentStatus.PAID) return // idempotent

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: parsed.data.paymentId,
        providerSignature: parsed.data.signature,
        verifiedAt: new Date(),
      },
    })

    const order = await tx.order.findUnique({
      where: { id: parsed.data.orderId },
      select: { id: true, status: true, couponId: true },
    })
    if (!order) throw new Error('ORDER_NOT_FOUND')

    if (order.status === OrderStatus.PENDING) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      })
      // Increment coupon usage
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }
    }
  })

  return NextResponse.json({ ok: true })
}
