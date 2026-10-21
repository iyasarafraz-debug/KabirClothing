import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export const metadata = { title: 'Shipping & Delivery', description: 'Shipping options and delivery timelines for Kabir Clothing orders.' }

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20 max-w-3xl">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Policy</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-10">Shipping & Delivery</h1>

          <div className="prose prose-sm max-w-none space-y-8 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Order processing</h2>
              <p>
                Orders are processed Monday through Saturday, excluding public holidays. Most orders
                are dispatched within 1–2 business days of being placed. You will receive a shipping
                confirmation email with tracking information once your parcel leaves our workshop.
              </p>
              <p className="mt-3">
                During sale periods or new drops, processing may take an additional 1–2 business days.
                If there is any unexpected delay, we will reach out to you by email.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Domestic shipping (India)</h2>
              <p>
                We currently ship to all serviceable PIN codes across India. Shipping is
                complimentary on orders above ₹1,500. For orders below that threshold, a flat shipping
                fee of ₹99 applies.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-3">
                <li>Metro cities: 2–4 business days after dispatch</li>
                <li>Other cities: 3–5 business days after dispatch</li>
                <li>Remote PIN codes: 5–7 business days after dispatch</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Tracking your order</h2>
              <p>
                Once your order ships, we will send you an email with the carrier name and tracking
                number. You can also find tracking information in your account under Orders. If you
                have not received shipping confirmation within 3 business days of placing your order,
                please contact us.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Shipping address accuracy</h2>
              <p>
                Please ensure your shipping address, PIN code, and phone number are correct at
                checkout. We are not responsible for delays or losses caused by incorrect or
                incomplete addresses. If you notice an error after placing your order, contact us
                immediately — we will do our best to update it before dispatch.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">International shipping</h2>
              <p>
                We currently ship within India only. International shipping is on our roadmap. Sign up
                for our newsletter to be notified when we launch international delivery.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Customs & duties</h2>
              <p>
                For domestic orders, all taxes are included in the displayed price — there are no
                additional charges at delivery.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
