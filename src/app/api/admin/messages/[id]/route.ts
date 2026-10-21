import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const message = await db.contactMessage.update({
    where: { id },
    data: { status: body?.status ?? 'READ' },
  })
  return NextResponse.json({ message })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await ctx.params
  await db.contactMessage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
