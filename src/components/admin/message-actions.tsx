'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, Check, MailOpen } from 'lucide-react'
import { toast } from 'sonner'

export function MessageActions({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [busy, setBusy] = useState(false)

  async function mark(newStatus: string) {
    setBusy(true)
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setStatus(newStatus)
      toast.success(`Marked as ${newStatus}`)
    } catch {
      toast.error('Could not update')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this message?')) return
    setBusy(true)
    try {
      await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      // Reload page to reflect removal
      window.location.reload()
    } catch {
      toast.error('Could not delete')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" variant="outline" disabled={busy || status === 'READ'} onClick={() => mark('READ')}>
        <MailOpen className="h-3.5 w-3.5 mr-1.5" /> Mark read
      </Button>
      <Button size="sm" variant="outline" disabled={busy || status === 'REPLIED'} onClick={() => mark('REPLIED')}>
        <Check className="h-3.5 w-3.5 mr-1.5" /> Mark replied
      </Button>
      <Button size="sm" variant="ghost" className="text-foreground/60 hover:text-destructive" disabled={busy} onClick={remove}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
