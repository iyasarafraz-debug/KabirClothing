import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AccountShell } from '@/components/shop/account-shell'
import { ProductCard } from '@/components/shop/product-card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login?callbackUrl=/account/wishlist')
  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const items = (wishlist?.items ?? []).map((i) => i.product)

  return (
    <AccountShell title="Wishlist">
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-2xl mb-2">Your wishlist is empty</p>
          <p className="text-sm text-foreground/60 mb-6">Tap the heart icon on any product to save it here.</p>
          <Link href="/shop" className="inline-flex items-center px-6 py-3 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
            Discover products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </AccountShell>
  )
}
