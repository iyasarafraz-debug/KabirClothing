import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const subscribers = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ subscribers })
}
