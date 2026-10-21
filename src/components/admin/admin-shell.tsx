'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  FolderTree,
  MessageSquare,
  Mail,
  Settings,
  Loader2,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
]

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin')
      return
    }
    if (status === 'authenticated') {
      if ((session?.user as any)?.role !== 'ADMIN') {
        router.push('/')
        return
      }
      // Auth check passed — mark as ready to render admin UI.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true)
    }
  }, [status, session, router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-muted/30">
      {/* Sidebar */}
      <aside className="lg:w-60 bg-kabir-black text-kabir-ivory lg:min-h-screen flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="block">
            <p className="font-serif text-2xl tracking-display font-semibold">KABIR</p>
            <p className="text-[10px] tracking-eyebrow text-kabir-ivory/60">ADMIN PANEL</p>
          </Link>
        </div>
        <nav className="p-3 space-y-0.5 flex lg:flex-col overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  active ? 'bg-white/10 text-kabir-ivory' : 'text-kabir-ivory/70 hover:text-kabir-ivory hover:bg-white/5'
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-kabir-ivory/70 hover:text-kabir-ivory hover:bg-white/5 mt-4 border-t border-white/10 pt-4"
          >
            <Settings className="h-4 w-4" /> Back to store
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-10">
        <h1 className="font-serif text-3xl lg:text-4xl tracking-display mb-8">{title}</h1>
        {children}
      </main>
    </div>
  )
}
