import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { ProductDetail } from '@/components/shop/product-detail'
import { ProductCard } from '@/components/shop/product-card'
import { ChevronRight, Box } from 'lucide-react'
import { formatINR } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { images: { take: 1 } },
  })
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.shortDescription ?? product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? product.description.slice(0, 160),
      images: product.images.map((img) => ({ url: img.url, alt: img.altText ?? product.name })),
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: 'asc' } },
      variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] },
      assets3d: true,
      reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
    },
  })
  if (!product || !product.isActive) notFound()

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
    include: { images: { take: 1, orderBy: { position: 'asc' } }, variants: true, assets3d: true },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Kabir Clothing' },
    category: product.category.name,
    image: product.images.map((i) => i.url),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.salePricePaise ?? product.pricePaise) / 100,
      availability: product.variants.some((v) => v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `/product/${product.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-kabir py-4 lg:py-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-foreground/60 mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/shop/${product.category.slug}`} className="hover:text-foreground capitalize">{product.category.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      <ProductDetail product={product as any} />

      {/* 3D viewer CTA */}
      {product.assets3d.length > 0 && (
        <div className="container-kabir py-8">
          <Link
            href={`/3d-viewer/${product.slug}`}
            className="group flex items-center justify-between gap-4 border border-border bg-card p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Box className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-serif text-xl">View in 3D</p>
                <p className="text-sm text-foreground/60">Rotate, zoom, and inspect this piece from every angle</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className="container-kabir py-12 lg:py-20 border-t border-border">
          <h2 className="font-serif text-3xl lg:text-4xl tracking-display mb-8">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
