/**
 * Cart endpoints.
 *
 * GET    /api/cart           — current cart (resolves user or guest)
 * POST   /api/cart           — add item { variantId, quantity }
 * PATCH  /api/cart           — update item { itemId, quantity }
 * DELETE /api/cart/[itemId]  — remove item
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getOrCreateCart, getGuestId, readGuestId, recomputeCartUnitPrices } from '@/lib/cart-server'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

async function resolveCartOwner() {
  const user = await getCurrentUser()
  const guestId = (await readGuestId()) ?? (await getGuestId())
  return { userId: user?.id ?? null, guestId }
}

export async function GET() {
  const { userId, guestId } = await resolveCartOwner()
  const cart = await getOrCreateCart({ userId, guestId })
  await recomputeCartUnitPrices(cart.id)
  const refreshed = await db.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, variant: true } } },
  })
  return NextResponse.json({ cart: refreshed })
}

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const variant = await db.productVariant.findUnique({
    where: { id: parsed.data.variantId },
    include: { product: true },
  })
  if (!variant || !variant.isActive || !variant.product.isActive) {
    return NextResponse.json({ error: 'Variant not available' }, { status: 404 })
  }
  if (parsed.data.quantity > variant.stock) {
    return NextResponse.json(
      { error: `Only ${variant.stock} in stock for ${variant.size} / ${variant.color}` },
      { status: 409 }
    )
  }

  const { userId, guestId } = await resolveCartOwner()
  const cart = await getOrCreateCart({ userId, guestId })

  const unitPricePaise =
    (variant.product.salePricePaise ?? variant.product.pricePaise) + variant.priceDeltaPaise

  const existing = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  })
  if (existing) {
    const newQty = existing.quantity + parsed.data.quantity
    if (newQty > variant.stock) {
      return NextResponse.json(
        { error: `Only ${variant.stock} in stock — you already have ${existing.quantity} in cart` },
        { status: 409 }
      )
    }
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    })
  } else {
    await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: variant.product.id,
        variantId: variant.id,
        quantity: parsed.data.quantity,
        unitPricePaise,
      },
    })
  }

  const refreshed = await db.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, variant: true } } },
  })
  return NextResponse.json({ cart: refreshed })
}

const updateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
})

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const item = await db.cartItem.findUnique({
    where: { id: parsed.data.itemId },
    include: { variant: true },
  })
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  if (parsed.data.quantity > item.variant.stock) {
    return NextResponse.json(
      { error: `Only ${item.variant.stock} in stock` },
      { status: 409 }
    )
  }

  const { userId, guestId } = await resolveCartOwner()
  const cart = await getOrCreateCart({ userId, guestId })
  if (item.cartId !== cart.id) {
    return NextResponse.json({ error: 'Item not in current cart' }, { status: 403 })
  }

  await db.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  })

  const refreshed = await db.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, variant: true } } },
  })
  return NextResponse.json({ cart: refreshed })
}
