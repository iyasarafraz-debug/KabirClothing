import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth-server'
import { addressSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await requireUser()
  const body = await req.json().catch(() => null)
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const existing = await db.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }
  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    })
  }
  const address = await db.address.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json({ address })
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await requireUser()
  const existing = await db.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }
  await db.address.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
