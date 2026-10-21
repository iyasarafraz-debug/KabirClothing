'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AccountShell } from '@/components/shop/account-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/auth/login?callbackUrl=/account/profile')
    if (session?.user?.name) setName(session.user.name)
  }, [status, session])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      // Demo: profile editing updates the user record via a minimal endpoint.
      // We don't expose a dedicated /api/me/profile PATCH yet — this would be
      // added in a production build. For now we just inform the user.
      toast.info('Profile editing will be available after the next deploy.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <AccountShell title="Profile">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
      </AccountShell>
    )
  }

  return (
    <AccountShell title="Profile">
      <form onSubmit={save} className="max-w-md space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" disabled value={session?.user?.email ?? ''} className="mt-1.5" />
          <p className="text-xs text-foreground/50 mt-1">Email cannot be changed.</p>
        </div>
        <Button type="submit" disabled={saving} className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save changes
        </Button>
      </form>
    </AccountShell>
  )
}
