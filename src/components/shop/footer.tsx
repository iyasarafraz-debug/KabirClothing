'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const SHOP_LINKS = [
  { label: 'All Products', href: '/shop' },
  { label: 'New Arrivals', href: '/shop/new-arrivals' },
  { label: 'Bestsellers', href: '/shop/bestsellers' },
  { label: "Men's Collection", href: '/shop/men' },
  { label: 'T-Shirts', href: '/shop/t-shirts' },
  { label: 'Shirts', href: '/shop/shirts' },
  { label: 'Hoodies', href: '/shop/hoodies' },
  { label: 'Trousers', href: '/shop/trousers' },
]

const HELP_LINKS = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns & Refunds', href: '/returns' },
  { label: 'About Kabir', href: '/about' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Subscription failed' }))
        throw new Error(data.error || 'Subscription failed')
      }
      toast.success('Welcome to Kabir Clothing. Check your inbox.')
      setEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Could not subscribe')
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer className="mt-auto bg-kabir-black text-kabir-ivory">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="container-kabir py-12 lg:py-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-3">Stay in the loop</p>
            <h2 className="font-serif text-3xl lg:text-4xl tracking-display">
              New drops, early access, and stories — straight to your inbox.
            </h2>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 lg:justify-end">
            <Input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/20 text-kabir-ivory placeholder:text-kabir-ivory/40 h-12 max-w-md"
            />
            <Button
              type="submit"
              disabled={busy}
              variant="default"
              className="bg-kabir-gold text-kabir-black hover:bg-kabir-gold/90 h-12 px-8"
            >
              {busy ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-kabir py-12 lg:py-16 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="font-serif text-3xl tracking-display font-semibold">
            KABIR
            <span className="block text-[10px] tracking-eyebrow font-sans font-light text-kabir-ivory/60 -mt-1">
              CLOTHING
            </span>
          </Link>
          <p className="mt-4 text-sm text-kabir-ivory/70 max-w-sm leading-relaxed">
            Premium contemporary fashion from India. Minimal luxury, modern streetwear, and elevated everyday essentials — designed and made with care.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-kabir-ivory/70 hover:text-kabir-gold transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-kabir-ivory/70 hover:text-kabir-gold transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-kabir-ivory/70 hover:text-kabir-gold transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-kabir-ivory/70 hover:text-kabir-gold transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-4">Shop</h3>
          <ul className="space-y-2.5 text-sm">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-kabir-ivory/70 hover:text-kabir-ivory transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-4">Help</h3>
          <ul className="space-y-2.5 text-sm">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-kabir-ivory/70 hover:text-kabir-ivory transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-4">Legal</h3>
          <ul className="space-y-2.5 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-kabir-ivory/70 hover:text-kabir-ivory transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-[11px] text-kabir-ivory/50 leading-relaxed">
            Customer support:<br />
            <a href="mailto:care@kabirclothing.example" className="hover:text-kabir-ivory">care@kabirclothing.example</a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kabir py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-kabir-ivory/50">
          <p>© {new Date().getFullYear()} Kabir Clothing. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Made in India</span>
            <span>·</span>
            <span>Prices in INR</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
