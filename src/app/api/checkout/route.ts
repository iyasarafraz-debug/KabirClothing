/**
 * Checkout flow — server-validated.
 *
 * Step 1: POST /api/checkout  — validates cart, stock, address, coupon.
 *         Returns: { orderNumber, totalPaise, payment: { providerOrderId?, gatewayReady } }
 *         If Razorpay is configured, a Razorpay order is created here.
 *         The order is created in PENDING status; payment confirmation completes it.
 *
 * Idempotency: the client sends `idempotencyKey`. If the same key is sent twice,
 * the existing order is returned without creating a new one.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkoutSchema } from '@/lib/validators'
import { getOrCreateCart, readGuestId, getGuestId, cartTotals } from '@/lib/cart-server'
import { getCurrentUser } from '@/lib/auth-server'
import { applyCoupon } from '@/lib/coupon'
import { createRazorpayOrder, isRazorpayConfigured } from '@/lib/payment'
import { generateOrderNumber } from '@/lib/format'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Idempotency: if the key already exists, return the existing order
  const existing = await db.order.findUnique({
    where: { idempotencyKey: parsed.data.idempotencyKey },
    include: { items: true, payment: true },
  })
  if (existing) {
    return NextResponse.json({
      orderNumber: existing.number,
      totalPaise: existing.totalPaise,
      payment: existing.payment
        ? {
            providerOrderId: existing.payment.providerOrderId,
            gatewayReady: Boolean(existing.payment.providerOrderId),
          }
        : null,
      alreadyExists: true,
    })
  }

  const user = await getCurrentUser()
  // Guests must provide an email so we can send order confirmation.
  if (!user && !parsed.data.email) {
    return NextResponse.json({ error: 'Email is required for guest checkout' }, { status: 400 })
  }
  const guestId = (await readGuestId()) ?? (await getGuestId())
  const cart = await getOrCreateCart({ userId: user?.id ?? null, guestId })
  // Load cart items fresh from the DB (server-authoritative).
  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { variant: true, product: true },
  })

  if (items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
  }

  // Re-validate stock and pricing on the server (NEVER trust client totals)
  for (const item of items) {
    if (item.quantity > item.variant.stock) {
      return NextResponse.json(
        { error: `Only ${item.variant.stock} of ${item.product.name} (${item.variant.size}/${item.variant.color}) in stock` },
        { status: 409 }
      )
    }
    const correctPaise =
      (item.product.salePricePaise ?? item.product.pricePaise) + item.variant.priceDeltaPaise
    if (correctPaise !== item.unitPricePaise) {
      return NextResponse.json(
        { error: `Price for ${item.product.name} has changed. Please review your cart.` },
        { status: 409 }
      )
    }
  }

  const totals = cartTotals(items.map((i) => ({ unitPricePaise: i.unitPricePaise, quantity: i.quantity })))

  let discountPaise = 0
  let couponId: string | undefined
  if (parsed.data.couponCode) {
    const couponResult = await applyCoupon(parsed.data.couponCode, totals.subtotalPaise)
    if (!couponResult.ok) {
      return NextResponse.json({ error: couponResult.message ?? 'Invalid coupon' }, { status: 400 })
    }
    discountPaise = couponResult.discountPaise
    couponId = couponResult.couponId
  }

  const totalPaise = totals.subtotalPaise + totals.shippingPaise - discountPaise

  // Create the order in a transaction with stock reservation
  const orderNumber = generateOrderNumber()
  const order = await db.$transaction(async (tx) => {
    // Re-check stock inside the transaction (concurrency-safe)
    for (const item of items) {
      const v = await tx.productVariant.findUnique({ where: { id: item.variantId } })
      if (!v || v.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${item.variantId}`)
      }
    }
    // Decrement stock
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }
    // Create order
    const newOrder = await tx.order.create({
      data: {
        number: orderNumber,
        userId: user?.id ?? null,
        guestEmail: user ? null : (parsed.data.email ?? null),
        status: OrderStatus.PENDING,
        subtotalPaise: totals.subtotalPaise,
        shippingPaise: totals.shippingPaise,
        taxPaise: totals.taxPaise,
        discountPaise,
        totalPaise,
        couponId,
        shippingAddress: JSON.stringify(parsed.data.shippingAddress),
        billingAddress: parsed.data.billingAddressSame
          ? JSON.stringify(parsed.data.shippingAddress)
          : parsed.data.billingAddress
            ? JSON.stringify(parsed.data.billingAddress)
            : null,
        notes: parsed.data.notes,
        idempotencyKey: parsed.data.idempotencyKey,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.product.name,
            variantSku: i.variant.sku,
            size: i.variant.size,
            color: i.variant.color,
            unitPricePaise: i.unitPricePaise,
            quantity: i.quantity,
            lineTotalPaise: i.unitPricePaise * i.quantity,
          })),
        },
      },
    })
    // Create payment record
    const gatewayReady = isRazorpayConfigured()
    let providerOrderId: string | null = null
    if (gatewayReady) {
      const rzp = await createRazorpayOrder(totalPaise, newOrder.number)
      providerOrderId = rzp?.providerOrderId ?? null
    }
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        provider: 'razorpay',
        providerOrderId,
        amountPaise: totalPaise,
        currency: 'INR',
        status: PaymentStatus.PENDING,
      },
    })
    return newOrder
  })

  // Clear the cart after successful order creation
  await db.cartItem.deleteMany({ where: { cartId: cart.id } })

  const payment = await db.payment.findUnique({ where: { orderId: order.id } })

  return NextResponse.json({
    orderNumber: order.number,
    orderId: order.id,
    totalPaise: order.totalPaise,
    payment: {
      providerOrderId: payment?.providerOrderId ?? null,
      gatewayReady: Boolean(payment?.providerOrderId),
      keyId: process.env.RAZORPAY_KEY_ID ?? null, // safe: publishable key only
    },
  })
}
