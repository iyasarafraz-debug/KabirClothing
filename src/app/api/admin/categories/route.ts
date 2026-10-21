import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const categories = await db.category.findMany({ include: { parent: true, _count: { select: { products: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  await requireAdmin()
  const body = await req.json().catch(() => null)
  if (!body?.name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const slug = body.slug ?? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const category = await db.category.create({
    data: { name: body.name, slug, description: body.description ?? null, parentId: body.parentId ?? null },
  })
  return NextResponse.json({ category })
}
