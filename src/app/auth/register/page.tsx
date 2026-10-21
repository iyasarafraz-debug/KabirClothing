'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Registration failed' }))
        throw new Error(d.error)
      }
      // Auto sign-in
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (!result || result.error) {
        toast.success('Account created — please sign in')
        router.push('/auth/login')
        return
      }
      toast.success('Welcome to Kabir Clothing')
      router.push('/account')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-kabir py-16 lg:py-24 max-w-md">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Join Kabir</p>
        <h1 className="font-serif text-4xl tracking-display">Create account</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5" autoComplete="new-password" />
          <p className="text-xs text-foreground/50 mt-1">Minimum 8 characters, including a letter and a number.</p>
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="mt-1.5" autoComplete="new-password" />
        </div>
        <Button type="submit" disabled={submitting} className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</> : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-foreground/60 mt-6">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-accent-foreground hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
