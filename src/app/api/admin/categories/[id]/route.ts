import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const category = await db.category.update({
    where: { id },
    data: {
      name: body?.name,
      slug: body?.slug,
      description: body?.description,
      parentId: body?.parentId ?? null,
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  await db.category.delete({ where: { id } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
