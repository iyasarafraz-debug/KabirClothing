import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await ctx.params
  const user = await requireUser()
  const wishlist = await db.wishlist.findUnique({ where: { userId: user.id } })
  if (!wishlist) return NextResponse.json({ error: 'Wishlist empty' }, { status: 404 })
  const item = await db.wishlistItem.findUnique({ where: { id: itemId } })
  if (!item || item.wishlistId !== wishlist.id) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  await db.wishlistItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}
