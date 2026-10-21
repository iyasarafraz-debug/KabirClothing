/**
 * Server-side authorization helpers.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user?.id) return null
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, emailVerified: true },
  })
  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Response('Unauthorized', { status: 401 })
  }
  if (user.role !== 'ADMIN') {
    throw new Response('Forbidden', { status: 403 })
  }
  return user
}
