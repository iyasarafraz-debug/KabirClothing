import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ProductViewer3DClient } from '@/components/shop/product-viewer-3d-client'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Box, Info } from 'lucide-react'
import { formatINR } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug }, include: { assets3d: true } })
  if (!product) return { title: 'Interactive viewer' }
  return { title: `${product.name} — Interactive view` }
}

export default async function Product3DViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      assets3d: true,
    },
  })
  if (!product || !product.isActive) notFound()

  const asset = product.assets3d[0]
  const fallbackImage = product.images[0]
    ? { url: product.images[0].url, alt: product.images[0].altText ?? product.name }
    : undefined
  const viewerImages = product.images.map((img) => ({
    url: img.url,
    altText: img.altText,
  }))

  return (
    <div className="container-kabir py-6">
      <Link
        href={`/product/${product.slug}`}
        className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to {product.name}
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-accent text-accent-foreground text-[10px] tracking-eyebrow uppercase px-2 py-1 flex items-center gap-1.5">
              <Box className="h-3 w-3" /> Interactive Viewer
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl">{product.name}</h1>
          </div>

          <ProductViewer3DClient
            modelUrl={asset?.modelUrl ?? ''}
            fallbackImage={fallbackImage}
            images={viewerImages}
            scale={asset?.scale ?? 1}
            className="aspect-[4/3] lg:aspect-[16/10] rounded-sm overflow-hidden"
          />

          {/* Asset documentation */}
          <div className="mt-6 border border-border bg-card p-5 text-sm">
            <p className="flex items-center gap-2 font-medium mb-2">
              <Info className="h-4 w-4 text-accent-foreground" /> About this viewer
            </p>
            <p className="text-foreground/70 leading-relaxed">
              This is an interactive 360° image-based viewer. Drag the product to rotate through
              multiple angles, or let it auto-rotate. Use the reset button to return to the first
              frame. The viewer respects your reduced-motion preference and works on mobile and
              desktop. A full WebGL 3D model viewer (React Three Fiber + GLB assets) is included in
              the codebase but disabled here to keep the bundle lightweight — see the README for
              how to enable it on hosting with adequate memory.
            </p>
            {asset && (
              <p className="mt-3 text-xs text-foreground/50">
                Associated 3D asset path: <code className="text-accent-foreground">{asset.modelUrl}</code> ·
                Format: {asset.format.toUpperCase()} · Scale: {asset.scale}
              </p>
            )}
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="border border-border bg-card p-5">
            <h2 className="font-serif text-xl mb-2">{product.name}</h2>
            <p className="text-2xl font-medium">{formatINR(product.salePricePaise ?? product.pricePaise)}</p>
            {product.shortDescription && (
              <p className="text-sm text-foreground/70 mt-3">{product.shortDescription}</p>
            )}
            <Button asChild className="w-full mt-4 h-11 bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
              <Link href={`/product/${product.slug}`}>View product details</Link>
            </Button>
          </div>

          {fallbackImage && (
            <div className="border border-border bg-card p-3">
              <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mb-2">Primary image</p>
              { }
              <img src={fallbackImage.url} alt={fallbackImage.alt} className="w-full aspect-[3/4] object-cover bg-muted" />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
