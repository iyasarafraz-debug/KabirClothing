/**
 * Admin product detail: GET, PATCH, DELETE
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, variants: true, images: { orderBy: { position: 'asc' } }, assets3d: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  // Pull out fields that need special handling
  const { variants, images, asset3dUrl, specifications, searchMetadata, ...patch } = body

  const data: Record<string, unknown> = { ...patch }
  if (specifications !== undefined) {
    data.specifications = typeof specifications === 'string' ? specifications : JSON.stringify(specifications)
  }
  if (searchMetadata !== undefined) {
    data.searchMetadata = typeof searchMetadata === 'string' ? searchMetadata : JSON.stringify(searchMetadata)
  }
  if (patch.slug) data.slug = slugify(patch.slug)

  const updated = await db.product.update({
    where: { id },
    data,
    include: { variants: true, images: true },
  })

  // Replace variants if provided
  if (Array.isArray(variants)) {
    await db.productVariant.deleteMany({ where: { productId: id } })
    for (const v of variants) {
      await db.productVariant.create({
        data: {
          productId: id,
          sku: v.sku ?? `${updated.sku}-${v.size}-${String(v.color).toUpperCase().replace(/\s+/g, '')}`,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex ?? null,
          stock: Number(v.stock ?? 0),
          priceDeltaPaise: Number(v.priceDeltaPaise ?? 0),
          isActive: v.isActive ?? true,
        },
      })
    }
  }
  // Replace images if provided
  if (Array.isArray(images)) {
    await db.productImage.deleteMany({ where: { productId: id } })
    for (const img of images) {
      await db.productImage.create({
        data: {
          productId: id,
          url: img.url,
          altText: img.altText ?? null,
          position: img.position ?? 0,
          isPrimary: img.isPrimary ?? false,
        },
      })
    }
  }
  // Replace 3D asset if provided
  if (typeof asset3dUrl === 'string' && asset3dUrl.length > 0) {
    await db.product3DAsset.deleteMany({ where: { productId: id } })
    await db.product3DAsset.create({
      data: { productId: id, modelUrl: asset3dUrl, format: 'glb', scale: 1.0 },
    })
  } else if (asset3dUrl === '') {
    await db.product3DAsset.deleteMany({ where: { productId: id } })
  }

  const refreshed = await db.product.findUnique({
    where: { id },
    include: { variants: true, images: true, assets3d: true },
  })
  return NextResponse.json({ product: refreshed })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  // Soft-delete by deactivating (preserves order history integrity)
  await db.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
