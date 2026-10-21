import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AccountShell } from '@/components/shop/account-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Heart, MapPin, User, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/account')

  return (
    <AccountShell title="My Account">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-accent-foreground" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60 mb-3">Track and review your orders.</p>
            <Link href="/account/orders" className="text-sm text-accent-foreground hover:underline">View orders →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent-foreground" /> Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60 mb-3">Pieces you've saved for later.</p>
            <Link href="/account/wishlist" className="text-sm text-accent-foreground hover:underline">View wishlist →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-foreground" /> Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60 mb-3">Manage shipping addresses.</p>
            <Link href="/account/addresses" className="text-sm text-accent-foreground hover:underline">Manage →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-accent-foreground" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60 mb-3">Update name and contact details.</p>
            <Link href="/account/profile" className="text-sm text-accent-foreground hover:underline">Edit profile →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-accent-foreground" /> Continue shopping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/60 mb-3">Browse new arrivals and bestsellers.</p>
            <Link href="/shop" className="text-sm text-accent-foreground hover:underline">Shop →</Link>
          </CardContent>
        </Card>
      </div>
    </AccountShell>
  )
}
