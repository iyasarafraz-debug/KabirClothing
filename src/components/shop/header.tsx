'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/stores/cart'
import { CartDrawer } from '@/components/shop/cart-drawer'
import { SearchDialog } from '@/components/shop/search-dialog'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

const NAV = [
  { label: 'New', href: '/shop/new-arrivals' },
  { label: 'Bestsellers', href: '/shop/bestsellers' },
  { label: 'Men', href: '/shop/men' },
  { label: 'T-Shirts', href: '/shop/t-shirts' },
  { label: 'Shirts', href: '/shop/shirts' },
  { label: 'Hoodies', href: '/shop/hoodies' },
  { label: 'Trousers', href: '/shop/trousers' },
  { label: 'Shop All', href: '/shop' },
]

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const cartOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const itemCount = useCartStore((s) => s.itemCount())
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu on route change — legitimate sync with navigation state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-kabir-black text-kabir-ivory text-[11px] tracking-eyebrow uppercase py-2 text-center">
        Complimentary shipping on orders above ₹1500 · Free returns within 7 days
      </div>

      <header
        className={`sticky top-0 z-40 w-full border-b border-border/60 backdrop-blur transition-colors ${
          scrolled ? 'bg-background/95' : 'bg-background'
        }`}
      >
        <div className="container-kabir flex h-16 items-center justify-between gap-4">
          {/* Left — mobile menu trigger + desktop nav */}
          <div className="flex items-center gap-2 flex-1">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-serif text-xl">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2.5 text-sm hover:bg-accent/10 hover:text-accent-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 border-t border-border pt-4 flex flex-col gap-1 text-sm">
                  <Link href="/about" className="px-3 py-2 hover:text-accent-foreground">About</Link>
                  <Link href="/contact" className="px-3 py-2 hover:text-accent-foreground">Contact</Link>
                  <Link href="/faqs" className="px-3 py-2 hover:text-accent-foreground">FAQs</Link>
                  <Link href="/shipping" className="px-3 py-2 hover:text-accent-foreground">Shipping</Link>
                  <Link href="/returns" className="px-3 py-2 hover:text-accent-foreground">Returns</Link>
                </div>
              </SheetContent>
            </Sheet>

            <nav className="hidden lg:flex items-center gap-6">
              {NAV.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[13px] tracking-wide hover:text-accent transition-colors ${
                    pathname === item.href ? 'text-accent' : 'text-foreground/80'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center — logo */}
          <Link href="/" className="flex items-center justify-center" aria-label="Kabir Clothing home">
            <span className="font-serif text-2xl sm:text-3xl tracking-display font-semibold">
              KABIR
              <span className="block text-[10px] tracking-eyebrow font-sans font-light text-foreground/60 -mt-1">
                CLOTHING
              </span>
            </span>
          </Link>

          {/* Right — actions */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {session?.user ? (
                  <>
                    <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="w-full">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="w-full">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist" className="w-full">Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/addresses" className="w-full">Addresses</Link>
                    </DropdownMenuItem>
                    {(session.user as any).role === 'ADMIN' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="w-full">Sign out</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/login" className="w-full">Sign in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/register" className="w-full">Create account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
              <Link href="/account/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              className="relative"
              onClick={() => setOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-semibold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setOpen} />
    </>
  )
}
