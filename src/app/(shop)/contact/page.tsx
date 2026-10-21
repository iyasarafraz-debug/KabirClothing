import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'
import { ContactForm } from '@/components/shop/contact-form'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Kabir Clothing customer care team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Get in touch</p>
              <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-6">We're here to help.</h1>
              <p className="text-foreground/70 leading-relaxed mb-8">
                Questions about a product, an order, or a return? Send us a message and our customer
                care team will get back to you within one business day. For order-specific questions,
                please include your order number.
              </p>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Customer care</dt>
                  <dd className="mt-1">
                    <a href="mailto:care@kabirclothing.example" className="hover:text-accent-foreground">care@kabirclothing.example</a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Hours</dt>
                  <dd className="mt-1">Monday – Saturday · 10:00 – 19:00 IST</dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-eyebrow uppercase text-foreground/60">Workshop</dt>
                  <dd className="mt-1">
                    Kabir Clothing Atelier<br />
                    Mumbai, India
                  </dd>
                </div>
              </dl>
            </div>

            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
