/**
 * POST /api/contact
 * Public contact form submission. Rate-limited.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limited = rateLimit(`contact:${ip}`, { max: 3, windowMs: 60 * 1000 })
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait a minute and try again.' },
      { status: 429 }
    )
  }
  const body = await req.json().catch(() => null)
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const user = await getCurrentUser()
  await db.contactMessage.create({
    data: {
      ...parsed.data,
      userId: user?.id ?? null,
    },
  })
  return NextResponse.json({ ok: true })
}
