/**
 * GET /api/me — current user's profile
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({ user })
}
