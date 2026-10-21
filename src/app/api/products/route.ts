import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || undefined
  const categorySlug = url.searchParams.get('category') || undefined
  const minPrice = url.searchParams.get('minPrice')
  const maxPrice = url.searchParams.get('maxPrice')
  const sizes = url.searchParams.get('sizes')?.split(',').filter(Boolean) || []
  const colors = url.searchParams.get('colors')?.split(',').filter(Boolean) || []
  const inStock = url.searchParams.get('inStock') === 'true'
  const featured = url.searchParams.get('featured') === 'true'
  const bestseller = url.searchParams.get('bestseller') === 'true'
  const newArrival = url.searchParams.get('newArrival') === 'true'
  const sort = url.searchParams.get('sort') || 'newest'
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize = Math.min(48, Math.max(1, parseInt(url.searchParams.get('pageSize') || '24', 10)))

  const where: Prisma.ProductWhereInput = { isActive: true }
  if (featured) where.featured = true
  if (bestseller) where.bestseller = true
  if (newArrival) where.newArrival = true

  if (categorySlug && categorySlug !== 'all') {
    const category = await db.category.findUnique({ where: { slug: categorySlug } })
    if (!category) return NextResponse.json({ items: [], total: 0, page, pageSize })
    where.categoryId = category.id
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { shortDescription: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
      { searchMetadata: { contains: q } },
    ]
  }

  if (minPrice || maxPrice) {
    where.pricePaise = {}
    if (minPrice) where.pricePaise.gte = Math.round(parseFloat(minPrice) * 100)
    if (maxPrice) where.pricePaise.lte = Math.round(parseFloat(maxPrice) * 100)
  }

  if (sizes.length || colors.length || inStock) {
    where.variants = { some: {} }
    if (sizes.length) where.variants.some.size = { in: sizes }
    if (colors.length) where.variants.some.color = { in: colors }
    if (inStock) where.variants.some.stock = { gt: 0 }
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc'
      ? { pricePaise: 'asc' }
      : sort === 'price-desc'
        ? { pricePaise: 'desc' }
        : sort === 'popular'
          ? { reviewCount: 'desc' }
          : { createdAt: 'desc' }

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: true,
        assets3d: true,
      },
    }),
  ])

  return NextResponse.json({ items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) })
}
