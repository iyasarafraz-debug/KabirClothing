import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await db.category.findMany({
    include: { parent: true },
    orderBy: [{ name: 'asc' }],
  })
  return NextResponse.json({ categories })
}
