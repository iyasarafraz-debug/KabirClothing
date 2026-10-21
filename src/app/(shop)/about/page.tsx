import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export const metadata = {
  title: 'About Kabir Clothing',
  description: 'The story of Kabir Clothing — premium contemporary fashion from India.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-kabir-black text-kabir-ivory py-20 lg:py-32">
          <div className="container-kabir max-w-3xl text-center">
            <p className="text-[11px] tracking-eyebrow uppercase text-kabir-gold mb-6">Our Story</p>
            <h1 className="font-serif text-4xl lg:text-6xl tracking-display leading-[1.05]">
              Quiet luxury, made with intention in India.
            </h1>
            <p className="mt-6 text-base lg:text-lg text-kabir-ivory/70 leading-relaxed">
              Kabir Clothing was founded on a simple belief: that premium fashion should be honest,
              well-made, and built to last — not chased by trend cycles or inflated by marketing.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="py-16 lg:py-24">
          <div className="container-kabir max-w-3xl space-y-12 text-base leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-serif text-3xl mb-4 text-foreground">A workshop, not a factory</h2>
              <p>
                Every Kabir piece begins in our small Indian workshop, where a tight team of tailors
                and pattern-makers has spent decades honing their craft. We cut in small batches,
                finish by hand, and inspect every piece before it leaves the atelier. The result is
                clothing with substance — seams that hold, fabric that drapes, and silhouettes that
                work as well on day one as on day one hundred.
              </p>
              <p className="mt-4">
                We deliberately avoid mass production. Small batches mean we can hold ourselves to a
                higher standard, waste less, and respond to feedback quickly. It also means we can
                pay our makers fairly and build long-term relationships with our fabric suppliers —
                many of whom we have worked with since the very first season.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl mb-4 text-foreground">Fabric-first design</h2>
              <p>
                We start with the cloth. A heavyweight 240 GSM organic cotton. A 13.5 oz selvedge
                denim woven on vintage shuttle looms. A European flax linen that softens with every
                wash. Only when the fabric is right do we cut and sew — because no amount of clever
                design can rescue a thin, lifeless material.
              </p>
              <p className="mt-4">
                Our pricing reflects this approach. We don't discount aggressively because we price
                honestly the first time. When you buy from Kabir, you are paying for the fabric, the
                make, and a fair margin — not for inflated marketing budgets or retailer markups.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-3xl mb-4 text-foreground">Built for the long run</h2>
              <p>
                We design pieces to outlive trends. Our essentials — the heavyweight tee, the oxford
                shirt, the structured hoodie, the selvedge denim — are the kind of items you reach
                for week after week, season after season. They age well, repair well, and stay in
                rotation long after trend-led pieces have been forgotten.
              </p>
              <p className="mt-4">
                If you have questions about a piece, our care guidance, or our repair service, our
                customer care team in India is available Monday to Saturday, 10am to 7pm IST.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
