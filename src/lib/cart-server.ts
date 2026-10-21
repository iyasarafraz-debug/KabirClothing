/**
 * Cart helpers — server-side.
 *
 * Strategy:
 *   - Authenticated users: cart is attached to userId.
 *   - Guests: cart is attached to a guestId (uuid stored in client cookie).
 *   - On login, the guest cart is merged into the user's cart.
 *
 * NOTE: Next.js 16 made `cookies()` async — all calls must `await`.
 */

import { db } from '@/lib/db'
import { cookies } from 'next/headers'

const GUEST_COOKIE = 'kc_guest_id'

export async function getGuestId(): Promise<string> {
  const store = await cookies()
  const existing = store.get(GUEST_COOKIE)?.value
  if (existing) return existing
  const fresh = `guest_${crypto.randomUUID()}`
  store.set(GUEST_COOKIE, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  })
  return fresh
}

export async function readGuestId(): Promise<string | null> {
  const store = await cookies()
  return store.get(GUEST_COOKIE)?.value ?? null
}

export async function getOrCreateCart(opts: { userId?: string | null; guestId?: string | null }) {
  // Try user cart first
  if (opts.userId) {
    let cart = await db.cart.findFirst({
      where: { userId: opts.userId },
      include: { items: { include: { product: true, variant: true } } },
    })
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: opts.userId },
        include: { items: { include: { product: true, variant: true } } },
      })
    }
    // If a guest cart exists, merge it in.
    if (opts.guestId) {
      const guestCart = await db.cart.findFirst({
        where: { guestId: opts.guestId },
        include: { items: true },
      })
      if (guestCart && guestCart.items.length > 0) {
        await mergeCarts(guestCart.id, cart.id)
        await db.cart.delete({ where: { id: guestCart.id } }).catch(() => {})
        cart = await db.cart.findUnique({
          where: { id: cart.id },
          include: { items: { include: { product: true, variant: true } } },
        })
      }
    }
    return cart!
  }

  // Guest cart
  if (opts.guestId) {
    let cart = await db.cart.findFirst({
      where: { guestId: opts.guestId },
      include: { items: { include: { product: true, variant: true } } },
    })
    if (!cart) {
      cart = await db.cart.create({
        data: { guestId: opts.guestId },
        include: { items: { include: { product: true, variant: true } } },
      })
    }
    return cart!
  }

  throw new Error('Either userId or guestId is required to resolve a cart')
}

async function mergeCarts(sourceCartId: string, targetCartId: string) {
  const sourceItems = await db.cartItem.findMany({ where: { cartId: sourceCartId } })
  for (const item of sourceItems) {
    const existing = await db.cartItem.findUnique({
      where: { cartId_variantId: { cartId: targetCartId, variantId: item.variantId } },
    })
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: item.quantity } },
      })
    } else {
      await db.cartItem.create({
        data: {
          cartId: targetCartId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPricePaise: item.unitPricePaise,
        },
      })
    }
  }
}

export async function recomputeCartUnitPrices(cartId: string) {
  const items = await db.cartItem.findMany({
    where: { cartId },
    include: { product: true, variant: true },
  })
  for (const item of items) {
    const basePaise = item.product.salePricePaise ?? item.product.pricePaise
    const correctPaise = basePaise + item.variant.priceDeltaPaise
    if (correctPaise !== item.unitPricePaise) {
      await db.cartItem.update({
        where: { id: item.id },
        data: { unitPricePaise: correctPaise },
      })
    }
  }
}

export function cartTotals(items: { unitPricePaise: number; quantity: number }[]) {
  const subtotalPaise = items.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0)
  const shippingPaise = subtotalPaise === 0 || subtotalPaise >= 150000 ? 0 : 9900
  const taxPaise = 0
  return { subtotalPaise, shippingPaise, taxPaise, totalPaise: subtotalPaise + shippingPaise + taxPaise }
}
