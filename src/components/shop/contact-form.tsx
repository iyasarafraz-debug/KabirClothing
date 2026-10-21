'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not send' }))
        throw new Error(d.error)
      }
      toast.success('Message sent — we will get back to you within one business day.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="border border-border bg-card p-6 lg:p-8 space-y-4">
      <div>
        <Label htmlFor="name">Full name *</Label>
        <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={saving} className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
        {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</> : 'Send message'}
      </Button>
    </form>
  )
}
