/**
 * Admin product management.
 * GET  /api/admin/products        — list (with pagination)
 * POST /api/admin/products        — create
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { productCreateSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  await requireAdmin()
  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize = Math.min(48, Math.max(1, parseInt(url.searchParams.get('pageSize') || '24', 10)))
  const q = url.searchParams.get('q')?.trim()
  const where = q
    ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { slug: { contains: q } }] }
    : {}
  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true, _count: { select: { variants: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])
  return NextResponse.json({ items, total, page, pageSize, pageCount: Math.ceil(total / pageSize) })
}

export async function POST(req: Request) {
  await requireAdmin()
  const body = await req.json().catch(() => null)
  const parsed = productCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const slugTaken = await db.product.findUnique({ where: { slug: parsed.data.slug } })
  if (slugTaken) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
  const skuTaken = await db.product.findUnique({ where: { sku: parsed.data.sku } })
  if (skuTaken) return NextResponse.json({ error: 'SKU already taken' }, { status: 409 })

  const {
    variants,
    images,
    specifications,
    searchMetadata,
    asset3dUrl,
    ...productData
  } = parsed.data

  const product = await db.product.create({
    data: {
      ...productData,
      specifications: specifications ? JSON.stringify(specifications) : null,
      searchMetadata: searchMetadata ? JSON.stringify(searchMetadata) : null,
      variants: {
        create: variants.map((v) => ({
          sku: `${parsed.data.sku}-${v.size}-${v.color.toUpperCase().replace(/\s+/g, '')}`,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: v.stock,
          priceDeltaPaise: v.priceDeltaPaise ?? 0,
          isActive: true,
        })),
      },
      images: {
        create: images.map((img) => ({
          url: img.url,
          altText: img.altText ?? null,
          position: img.position ?? 0,
          isPrimary: img.isPrimary ?? false,
        })),
      },
      assets3d: asset3dUrl ? { create: { modelUrl: asset3dUrl, format: 'glb', scale: 1.0 } } : undefined,
    },
    include: { variants: true, images: true, assets3d: true },
  })
  return NextResponse.json({ product })
}
