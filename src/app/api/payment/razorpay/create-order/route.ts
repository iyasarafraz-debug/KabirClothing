/**
 * POST /api/payment/razorpay/create-order
 *
 * (Re)creates a Razorpay order for an existing PENDING order.
 * Useful if the user closed the checkout modal before paying.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createRazorpayOrder, isRazorpayConfigured } from '@/lib/payment'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({ orderId: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payment: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Already have a provider order id?
  if (order.payment?.providerOrderId) {
    return NextResponse.json({
      providerOrderId: order.payment.providerOrderId,
      keyId: process.env.RAZORPAY_KEY_ID,
      amountPaise: order.totalPaise,
    })
  }

  const rzp = await createRazorpayOrder(order.totalPaise, order.number)
  if (!rzp) {
    return NextResponse.json({ error: 'Could not create provider order' }, { status: 502 })
  }

  if (order.payment) {
    await db.payment.update({
      where: { id: order.payment.id },
      data: { providerOrderId: rzp.providerOrderId },
    })
  } else {
    await db.payment.create({
      data: {
        orderId: order.id,
        provider: 'razorpay',
        providerOrderId: rzp.providerOrderId,
        amountPaise: order.totalPaise,
        status: 'PENDING',
      },
    })
  }

  return NextResponse.json({
    providerOrderId: rzp.providerOrderId,
    keyId: process.env.RAZORPAY_KEY_ID,
    amountPaise: order.totalPaise,
  })
}
