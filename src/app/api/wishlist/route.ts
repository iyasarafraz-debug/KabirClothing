/**
 * Wishlist endpoints (auth required).
 *
 * GET    /api/wishlist              — list items
 * POST   /api/wishlist              — add { productId, variantId? }
 * DELETE /api/wishlist/[itemId]     — remove
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await requireUser()
  const wishlist = await db.wishlist.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { position: 'asc' } }, variants: true },
          },
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return NextResponse.json({ wishlist })
}

const addSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  const body = await req.json().catch(() => null)
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const wishlist = await db.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  })
  const item = await db.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId: parsed.data.productId } },
    update: { variantId: parsed.data.variantId ?? null },
    create: {
      wishlistId: wishlist.id,
      productId: parsed.data.productId,
      variantId: parsed.data.variantId ?? null,
    },
    include: {
      product: { include: { images: { take: 1, orderBy: { position: 'asc' } }, variants: true } },
      variant: true,
    },
  })
  return NextResponse.json({ item })
}
