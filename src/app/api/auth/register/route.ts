/**
 * POST /api/auth/register
 * Registers a new customer account (NOT admin).
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limited = rateLimit(`register:${ip}`, { max: 5, windowMs: 60 * 1000 })
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 }
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { email, password, name } = parsed.data
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({
    data: { email, name, passwordHash, role: UserRole.CUSTOMER },
  })
  return NextResponse.json({ ok: true })
}
