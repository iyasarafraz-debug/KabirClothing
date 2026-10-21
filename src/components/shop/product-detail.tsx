'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Minus, Plus, ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatINR } from '@/lib/format'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Variant = {
  id: string
  size: string
  color: string
  colorHex?: string | null
  stock: number
}

type Product = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  description: string
  pricePaise: number
  salePricePaise: number | null
  fit: string | null
  fabric: string | null
  careInstructions: string | null
  specifications: string | null
  images: { url: string; altText?: string | null }[]
  variants: Variant[]
  assets3d: { id: string }[]
}

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [wishlisting, setWishlisting] = useState(false)
  const { setItems, setOpen } = useCartStore()
  const { data: session } = useSession()

  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)))
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)))
  const colors = uniqueColors.map((color) => ({
    color,
    hex: product.variants.find((v) => v.color === color)?.colorHex ?? '#cccccc',
  }))

  // Find the variant matching selected size + color
  const selectedVariant =
    selectedSize && selectedColor
      ? product.variants.find(
          (v) => v.size === selectedSize && v.color === selectedColor
        )
      : null

  const effectivePrice = product.salePricePaise ?? product.pricePaise
  const discountPct = product.salePricePaise
    ? Math.round((1 - product.salePricePaise / product.pricePaise) * 100)
    : 0

  const specs: Record<string, string> = product.specifications
    ? (() => {
        try {
          return JSON.parse(product.specifications)
        } catch {
          return {}
        }
      })()
    : {}

  async function addToCart() {
    if (!selectedVariant) {
      toast.error('Please select a size and colour')
      return
    }
    if (selectedVariant.stock < quantity) {
      toast.error(`Only ${selectedVariant.stock} in stock`)
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not add to bag' }))
        throw new Error(d.error)
      }
      const data = await res.json()
      setItems(data.cart?.items ?? [])
      toast.success('Added to bag')
      setOpen(true)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function addToWishlist() {
    if (!session) {
      toast.info('Please sign in to save items to your wishlist')
      return
    }
    setWishlisting(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: 'Could not save' }))
        throw new Error(d.error)
      }
      toast.success('Saved to wishlist')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setWishlisting(false)
    }
  }

  return (
    <div className="container-kabir">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image gallery */}
        <div>
          <div className="aspect-[3/4] bg-muted overflow-hidden">
            { }
            <img
              src={product.images[selectedImage]?.url}
              alt={product.images[selectedImage]?.altText ?? product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-[3/4] bg-muted overflow-hidden border-2 ${
                    i === selectedImage ? 'border-kabir-black' : 'border-transparent'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  { }
                  <img src={img.url} alt={img.altText ?? `Image ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="flex items-center gap-2 mb-3">
            {product.salePricePaise && (
              <span className="bg-kabir-black text-kabir-ivory text-[10px] tracking-eyebrow uppercase px-2 py-1">
                -{discountPct}%
              </span>
            )}
            {product.assets3d.length > 0 && (
              <span className="bg-accent text-accent-foreground text-[10px] tracking-eyebrow uppercase px-2 py-1">
                3D Available
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl tracking-display">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-foreground/70">{product.shortDescription}</p>
          )}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatINR(effectivePrice)}</span>
            {product.salePricePaise && (
              <span className="text-lg text-foreground/50 line-through">
                {formatINR(product.pricePaise)}
              </span>
            )}
            <span className="text-xs text-foreground/50 ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Size</p>
              {product.fit && <p className="text-xs text-foreground/50">{product.fit}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const hasStockForSize = product.variants.some((v) => v.size === size && v.stock > 0)
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!hasStockForSize}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-11 px-3 text-sm border transition-colors ${
                      selectedSize === size
                        ? 'border-kabir-black bg-kabir-black text-kabir-ivory'
                        : hasStockForSize
                          ? 'border-border hover:border-foreground'
                          : 'border-border text-foreground/30 cursor-not-allowed line-through'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color */}
          <div className="mt-6">
            <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-3">
              Colour {selectedColor && <span className="text-foreground/80 normal-case tracking-normal ml-1">· {selectedColor}</span>}
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map(({ color, hex }) => {
                const hasStockForColor = product.variants.some((v) => v.color === color && v.stock > 0)
                return (
                  <button
                    key={color}
                    type="button"
                    disabled={!hasStockForColor}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    aria-label={color}
                    className={`h-9 w-9 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-accent scale-110' : 'border-border'
                    } ${!hasStockForColor ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: hex }}
                  />
                )
              })}
            </div>
          </div>

          {/* Stock notice */}
          {selectedVariant && (
            <p className={`mt-4 text-xs ${selectedVariant.stock > 0 ? 'text-foreground/60' : 'text-destructive'}`}>
              {selectedVariant.stock === 0
                ? 'Out of stock in this combination'
                : selectedVariant.stock <= 5
                  ? `Only ${selectedVariant.stock} left in this combination`
                  : 'In stock'}
            </p>
          )}

          {/* Quantity + add to cart */}
          <div className="mt-6 flex gap-3">
            <div className="inline-flex items-center border border-border h-12">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={addToCart}
              disabled={adding || !selectedVariant || selectedVariant.stock === 0}
              className="flex-1 h-12 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal"
            >
              {adding ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding…</>
              ) : !selectedVariant ? (
                'Select size & colour'
              ) : selectedVariant.stock === 0 ? (
                'Out of stock'
              ) : (
                <><ShoppingBag className="h-4 w-4 mr-2" /> Add to bag</>
              )}
            </Button>
            <Button
              onClick={addToWishlist}
              disabled={wishlisting}
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label="Add to wishlist"
            >
              {wishlisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick reassurance */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center text-[11px] text-foreground/60">
            <div><Check className="h-4 w-4 mx-auto mb-1 text-accent-foreground" /> Free shipping<br />above ₹1500</div>
            <div><Check className="h-4 w-4 mx-auto mb-1 text-accent-foreground" /> 7-day<br />easy returns</div>
            <div><Check className="h-4 w-4 mx-auto mb-1 text-accent-foreground" /> Authentic<br />products</div>
          </div>

          {/* Details accordion */}
          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="description">
              <AccordionTrigger className="text-sm tracking-wide">Description</AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/70 leading-relaxed whitespace-pre-line">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            {product.fit && (
              <AccordionItem value="fit">
                <AccordionTrigger className="text-sm tracking-wide">Fit & Sizing</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed">
                  {product.fit}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.fabric && (
              <AccordionItem value="fabric">
                <AccordionTrigger className="text-sm tracking-wide">Fabric</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed">
                  {product.fabric}
                </AccordionContent>
              </AccordionItem>
            )}
            {product.careInstructions && (
              <AccordionItem value="care">
                <AccordionTrigger className="text-sm tracking-wide">Care Instructions</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed">
                  {product.careInstructions}
                </AccordionContent>
              </AccordionItem>
            )}
            {Object.keys(specs).length > 0 && (
              <AccordionItem value="specs">
                <AccordionTrigger className="text-sm tracking-wide">Specifications</AccordionTrigger>
                <AccordionContent>
                  <dl className="text-sm">
                    {Object.entries(specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                        <dt className="text-foreground/60">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
