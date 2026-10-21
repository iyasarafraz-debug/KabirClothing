import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import { couponCreateSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  await requireAdmin()
  const body = await req.json().catch(() => null)
  const parsed = couponCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const coupon = await db.coupon.create({
    data: {
      ...parsed.data,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      maxDiscountPaise: parsed.data.maxDiscountPaise ?? null,
      usageLimit: parsed.data.usageLimit ?? null,
    },
  })
  return NextResponse.json({ coupon })
}
