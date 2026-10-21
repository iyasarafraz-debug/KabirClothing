/**
 * POST /api/newsletter
 * Public newsletter subscription. Idempotent.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSchema } from '@/lib/validators'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limited = rateLimit(`newsletter:${ip}`, { max: 5, windowMs: 60 * 1000 })
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many attempts.' }, { status: 429 })
  }
  const body = await req.json().catch(() => null)
  const parsed = newsletterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name ?? null, isActive: true },
    create: { email: parsed.data.email, name: parsed.data.name ?? null, source: 'FOOTER' },
  })
  return NextResponse.json({ ok: true })
}
