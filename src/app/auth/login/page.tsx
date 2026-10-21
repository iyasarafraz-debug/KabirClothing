'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const callbackUrl = sp.get('callbackUrl') ?? '/account'
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!res || res.error) {
        throw new Error('Invalid email or password')
      }
      toast.success('Welcome back')
      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={submitting} className="w-full h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : 'Sign in'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="container-kabir py-16 lg:py-24 max-w-md">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Welcome back</p>
        <h1 className="font-serif text-4xl tracking-display">Sign in</h1>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-foreground/60">Loading…</div>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-foreground/60 mt-6">
        New to Kabir?{' '}
        <Link href="/auth/register" className="text-accent-foreground hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 p-4 border border-border bg-muted/40 text-xs text-foreground/70">
        <p className="font-medium mb-1">Demo admin credentials</p>
        <p>Email: <code className="bg-background px-1.5 py-0.5">admin@kabirclothing.example</code></p>
        <p>Password: <code className="bg-background px-1.5 py-0.5">ChangeMeOnFirstLogin!2025</code></p>
        <p className="mt-2 text-foreground/50">Change these immediately on first login via the environment variables.</p>
      </div>
    </div>
  )
}
