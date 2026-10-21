import Link from 'next/link'
import { db } from '@/lib/db'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headset } from 'lucide-react'
import { formatINR } from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  const [featured, newArrivals, bestsellers] = await Promise.all([
    db.product.findMany({
      where: { isActive: true, featured: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.findMany({
      where: { isActive: true, newArrival: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
    db.product.findMany({
      where: { isActive: true, bestseller: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { position: 'asc' } }, variants: true, assets3d: true },
    }),
  ])
  return { featured, newArrivals, bestsellers }
}

const VALUE_PROPS = [
  { icon: Truck, title: 'Complimentary Shipping', desc: 'On all orders above ₹1500' },
  { icon: RefreshCw, title: '7-Day Easy Returns', desc: 'No-questions-asked returns' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'Razorpay-verified checkout' },
  { icon: Headset, title: 'Customer Care', desc: 'Mon–Sat · 10am–7pm IST' },
]

export default async function HomePage() {
  const { featured, newArrivals, bestsellers } = await getHomeData()
  const hero = featured[0] ?? newArrivals[0]

  return (
    <>
      {/* HERO — editorial premium */}
      <section className="relative bg-kabir-black text-kabir-ivory overflow-hidden">
        <div className="container-kabir grid lg:grid-cols-2 gap-0 lg:gap-12 items-stretch min-h-[78vh]">
          <div className="flex flex-col justify-center py-12 lg:py-0 lg:pr-8 order-2 lg:order-1">
            <p className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-6">
              Autumn / Winter 2025 · The Foundations Edit
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-display leading-[1.02]">
              Quiet luxury,<br />
              <span className="italic font-normal text-kabir-gold">made in India.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-kabir-ivory/70 leading-relaxed">
              A considered wardrobe of elevated essentials — heavyweight tees, oxford shirts,
              structured hoodies, and selvedge denim. Cut from premium fabrics, built to last.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-kabir-gold text-kabir-black hover:bg-kabir-gold/90 h-12 px-8">
                <Link href="/shop">
                  Shop the collection <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-kabir-ivory/30 text-kabir-ivory hover:bg-kabir-ivory/10 hover:text-kabir-ivory h-12 px-8"
              >
                <Link href="/shop/new-arrivals">New arrivals</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="font-serif text-3xl text-kabir-gold">10+</p>
                <p className="text-[11px] tracking-eyebrow uppercase text-kabir-ivory/50 mt-1">Curated pieces</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-kabir-gold">240<span className="text-base">gsm</span></p>
                <p className="text-[11px] tracking-eyebrow uppercase text-kabir-ivory/50 mt-1">Heavyweight cotton</p>
              </div>
              <div>
                <p className="font-serif text-3xl text-kabir-gold">100%</p>
                <p className="text-[11px] tracking-eyebrow uppercase text-kabir-ivory/50 mt-1">Made in India</p>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 min-h-[40vh] lg:min-h-full">
            {hero && (
               
              <img
                src={hero.images[0]?.url}
                alt={hero.images[0]?.altText ?? hero.name}
                className="absolute inset-0 h-full w-full object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-kabir-black/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-kabir-black/30" />
            {hero && (
              <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 lg:max-w-xs">
                <p className="text-[11px] tracking-eyebrow uppercase text-kabir-ivory/70 mb-2">Featured</p>
                <Link href={`/product/${hero.slug}`} className="block group">
                  <p className="font-serif text-2xl text-kabir-ivory group-hover:text-kabir-gold transition-colors">
                    {hero.name}
                  </p>
                  <p className="text-sm text-kabir-ivory/70 mt-1">{formatINR(hero.salePricePaise ?? hero.pricePaise)}</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-b border-border bg-card">
        <div className="container-kabir grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="flex flex-col items-center text-center px-4 py-6 lg:py-8">
              <v.icon className="h-6 w-6 text-accent-foreground mb-3" strokeWidth={1.4} />
              <p className="text-xs font-medium tracking-wide">{v.title}</p>
              <p className="text-[11px] text-foreground/60 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="py-16 lg:py-24">
        <div className="container-kabir">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Just landed</p>
              <h2 className="font-serif text-4xl lg:text-5xl tracking-display">New Arrivals</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/shop/new-arrivals">View all <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial split banner */}
      <section className="bg-muted/40 py-16 lg:py-24">
        <div className="container-kabir grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="aspect-[4/5] bg-card overflow-hidden">
            { }
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
              alt="The Kabir Atelier — craftsmanship"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-4">The Kabir Atelier</p>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-display leading-[1.05]">
              Cut, sewn, and finished by hand in our Indian workshop.
            </h2>
            <p className="mt-6 text-base text-foreground/70 leading-relaxed max-w-lg">
              Every Kabir piece begins with a single bolt of fabric and a small team of tailors who
              have spent decades perfecting their craft. We make in small batches — never mass-produced —
              so quality stays high and waste stays low.
            </p>
            <Button asChild variant="outline" className="mt-8 h-12 px-8">
              <Link href="/about">Our story <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16 lg:py-24">
        <div className="container-kabir">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Loved by you</p>
              <h2 className="font-serif text-4xl lg:text-5xl tracking-display">Bestsellers</h2>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/shop/bestsellers">View all <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="pb-16 lg:pb-24">
        <div className="container-kabir">
          <div className="grid lg:grid-cols-3 gap-4">
            <CategoryTile href="/shop/t-shirts" title="T-Shirts" image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80" />
            <CategoryTile href="/shop/hoodies" title="Hoodies & Sweats" image="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80" />
            <CategoryTile href="/shop/trousers" title="Trousers & Denim" image="https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80" />
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryTile({ href, title, image }: { href: string; title: string; image: string }) {
  return (
    <Link href={href} className="group relative block aspect-[16/10] overflow-hidden bg-muted">
      { }
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-kabir-black/70 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-kabir-ivory">
        <h3 className="font-serif text-2xl lg:text-3xl">{title}</h3>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
