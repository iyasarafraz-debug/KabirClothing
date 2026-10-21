import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getOrCreateCart, readGuestId, getGuestId } from '@/lib/cart-server'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await ctx.params
  const user = await getCurrentUser()
  const guestId = (await readGuestId()) ?? (await getGuestId())
  const cart = await getOrCreateCart({ userId: user?.id ?? null, guestId })

  const item = await db.cartItem.findUnique({ where: { id: itemId } })
  if (!item || item.cartId !== cart.id) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  await db.cartItem.delete({ where: { id: itemId } })
  const refreshed = await db.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, variant: true } } },
  })
  return NextResponse.json({ cart: refreshed })
}
