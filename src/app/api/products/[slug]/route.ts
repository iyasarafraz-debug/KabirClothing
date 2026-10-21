import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] },
      assets3d: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { user: { select: { name: true } } },
      },
    },
  })
  if (!product || !product.isActive) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    include: { images: { take: 1, orderBy: { position: 'asc' } } },
  })
  return NextResponse.json({ product, related })
}
