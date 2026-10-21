'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Package, Heart, MapPin, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: User },
]

export function AccountShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="container-kabir py-10 lg:py-16">
      <div className="mb-8">
        <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-2">My Account</p>
        <h1 className="font-serif text-4xl lg:text-5xl tracking-display">{title}</h1>
        {session?.user?.email && <p className="text-sm text-foreground/60 mt-2">{session.user.email}</p>}
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <aside>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-kabir-black text-kabir-ivory' : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              )
            })}
            {(session?.user as any)?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted border-t border-border mt-3 pt-3"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start px-3 mt-2 text-foreground/60 hover:text-destructive"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4 mr-3" /> Sign out
            </Button>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  )
}
