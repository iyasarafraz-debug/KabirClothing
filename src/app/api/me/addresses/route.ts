/**
 * Address CRUD for current user.
 * GET  /api/me/addresses
 * POST /api/me/addresses
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth-server'
import { addressSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await requireUser()
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ addresses })
}

export async function POST(req: Request) {
  const user = await requireUser()
  const body = await req.json().catch(() => null)
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // If isDefault, unset others
  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    })
  }
  const address = await db.address.create({
    data: { ...parsed.data, userId: user.id },
  })
  return NextResponse.json({ address })
}
