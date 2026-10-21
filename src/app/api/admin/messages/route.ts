import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { email: true, name: true } } },
  })
  return NextResponse.json({ messages })
}
