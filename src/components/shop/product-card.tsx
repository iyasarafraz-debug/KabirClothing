'use client'

import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/format'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

type Product = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  pricePaise: number
  salePricePaise: number | null
  images: { url: string; altText?: string | null }[]
  variants: { stock: number }[]
  assets3d?: { id: string }[]
}

export function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false)
  const { data: session } = useSession()
  const primary = product.images?.[0]
  const secondary = product.images?.[1] ?? primary
  const inStock = product.variants.some((v) => v.stock > 0)
  const has3d = (product.assets3d?.length ?? 0) > 0

  async function quickAdd() {
    if (!session) {
      toast.info('Sign in to add items to your wishlist')
      return
    }
    setAdding(true)
    try {
      // Find first in-stock variant
      const variant = await fetch(`/api/products/${product.slug}`).then((r) => r.json())
      const firstVariant = variant.product?.variants?.find((v: any) => v.stock > 0)
      if (!firstVariant) {
        toast.error('No available variant')
        return
      }
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, variantId: firstVariant.id }),
      })
      if (!res.ok) throw new Error('Could not add to wishlist')
      toast.success('Saved to wishlist')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {/* Primary image */}
          { }
          <img
            src={primary?.url}
            alt={primary?.altText ?? product.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              secondary !== primary ? 'group-hover:opacity-0' : ''
            }`}
            loading="lazy"
          />
          {/* Secondary image (hover) */}
          {secondary !== primary && (
             
            <img
              src={secondary.url}
              alt={secondary.altText ?? product.name}
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.salePricePaise && (
              <span className="bg-kabir-black text-kabir-ivory text-[10px] tracking-eyebrow uppercase px-2 py-1">Sale</span>
            )}
            {has3d && (
              <span className="bg-kabir-gold text-kabir-black text-[10px] tracking-eyebrow uppercase px-2 py-1">3D</span>
            )}
            {!inStock && (
              <span className="bg-foreground/60 text-background text-[10px] tracking-eyebrow uppercase px-2 py-1">Sold out</span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={quickAdd}
        disabled={adding}
        aria-label="Add to wishlist"
        className="absolute top-3 right-3 bg-background/90 backdrop-blur h-9 w-9 flex items-center justify-center hover:bg-background shadow-sm transition-colors"
      >
        <Heart className="h-4 w-4" />
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium hover:text-accent-foreground line-clamp-1"
          >
            {product.name}
          </Link>
          {product.shortDescription && (
            <p className="text-xs text-foreground/60 mt-0.5 line-clamp-1">{product.shortDescription}</p>
          )}
        </div>
        <div className="text-sm font-medium whitespace-nowrap">
          {product.salePricePaise ? (
            <>
              <span className="text-destructive line-through text-xs mr-1.5">
                {formatINR(product.pricePaise)}
              </span>
              {formatINR(product.salePricePaise)}
            </>
          ) : (
            formatINR(product.pricePaise)
          )}
        </div>
      </div>

      <Button asChild className="mt-3 w-full h-9 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
        <Link href={`/product/${product.slug}`}>
          <ShoppingBag className="h-3.5 w-3.5 mr-2" /> View
        </Link>
      </Button>
    </div>
  )
}
