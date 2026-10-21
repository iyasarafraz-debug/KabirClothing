import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export const metadata = { title: 'Returns & Refunds', description: 'Return and refund policy for Kabir Clothing.' }

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20 max-w-3xl">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Policy</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-10">Returns & Refunds</h1>

          <div className="space-y-8 text-foreground/80 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">7-day return window</h2>
              <p>
                We accept returns within 7 days of delivery for items that are unworn, unwashed, and
                have all original tags attached. Footwear must be returned in the original box.
                Innerwear, swimwear, and accessories are non-returnable for hygiene reasons.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">How to initiate a return</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Sign in to your account and visit Orders.</li>
                <li>Select the order containing the item you wish to return.</li>
                <li>Email care@kabirclothing.example with your order number and the items you want to return.</li>
                <li>We will reply with a return authorisation and the return shipping address within 1 business day.</li>
                <li>Pack the items securely with all original packaging and tags.</li>
                <li>Ship the parcel using any trackable courier. Keep the tracking number until your refund is processed.</li>
              </ol>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Refund processing</h2>
              <p>
                Once we receive your return, our team will inspect it and notify you of the approval or
                rejection within 2 business days. Approved refunds are processed to the original
                payment method within 5–7 business days. The exact time for the refund to appear
                depends on your bank or card issuer.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Return shipping costs</h2>
              <p>
                If the return is due to a defect on our part or a wrong item shipped, we will cover the
                return shipping cost. For all other returns (such as change of mind or sizing), the
                return shipping cost is borne by the customer.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Exchanges</h2>
              <p>
                We do not offer direct exchanges. To exchange an item, please return the original for
                a refund and place a new order for the desired size or colour. This ensures faster
                processing and avoids inventory conflicts.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Damaged or defective items</h2>
              <p>
                If you receive a damaged or defective item, please contact us within 48 hours of
                delivery with photos of the defect and your order number. We will arrange a free
                return and either replace the item or issue a full refund, as you prefer.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">Non-returnable items</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Innerwear and socks (for hygiene reasons)</li>
                <li>Items worn, washed, or with tags removed</li>
                <li>Items purchased during final sale events (clearly marked at the time of purchase)</li>
                <li>Gift cards</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
