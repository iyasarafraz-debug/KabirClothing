import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export const metadata = { title: 'Terms & Conditions', description: 'Terms and conditions for using Kabir Clothing.' }

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20 max-w-3xl">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Legal</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-3">Terms & Conditions</h1>
          <p className="text-sm text-foreground/60 mb-10">Last updated: October 2025</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">1. Acceptance of terms</h2>
              <p>
                By accessing or using the Kabir Clothing website (the "Service"), you agree to be
                bound by these Terms & Conditions. If you do not agree, please do not use the Service.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and legally capable of entering into binding
                contracts to use this Service. By placing an order, you represent that you meet these
                requirements.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">3. Accounts</h2>
              <p>
                When you create an account, you agree to provide accurate and complete information
                and to keep your password confidential. You are responsible for all activity under
                your account. Notify us immediately of any unauthorised use.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">4. Orders & pricing</h2>
              <p>
                All orders are subject to availability and confirmation of the order price. Prices
                are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right
                to refuse or cancel any order at our discretion, including in cases of pricing errors
                or suspected fraud. If we cancel an order after payment, we will issue a full refund.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">5. Payments</h2>
              <p>
                Payments are processed securely through Razorpay. We do not store your full card
                number or CVV. By placing an order, you authorise us to charge the displayed total to
                your chosen payment method.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">6. Shipping & delivery</h2>
              <p>
                Shipping timelines are estimates and may vary. Title and risk of loss pass to you
                upon delivery. Please see our Shipping & Delivery policy for full details.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">7. Returns & refunds</h2>
              <p>
                Returns are accepted within 7 days of delivery subject to the conditions in our
                Returns & Refunds policy. Refunds are processed to the original payment method.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">8. Intellectual property</h2>
              <p>
                All content on this website — including text, graphics, logos, images, and software
                — is the property of Kabir Clothing or its licensors and is protected by Indian and
                international intellectual property laws. You may not reproduce, modify, or
                distribute any content without our prior written consent.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">9. Prohibited conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
                <li>Attempt to gain unauthorised access to any part of the Service, other accounts, or computer systems.</li>
                <li>Use bots, scrapers, or other automated tools to access the Service without our consent.</li>
                <li>Interfere with the proper functioning of the Service.</li>
                <li>Submit false, misleading, or fraudulent information.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">10. Disclaimers</h2>
              <p>
                The Service is provided on an "as is" and "as available" basis. We make no
                warranties, express or implied, regarding the Service's operation or the accuracy of
                information on it. To the fullest extent permitted by law, we disclaim all
                warranties.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">11. Limitation of liability</h2>
              <p>
                To the fullest extent permitted by law, Kabir Clothing shall not be liable for any
                indirect, incidental, consequential, or punitive damages arising from your use of
                the Service.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">12. Governing law</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes will be subject to the
                exclusive jurisdiction of the courts in Mumbai, India.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">13. Changes to terms</h2>
              <p>
                We may update these Terms from time to time. We will post the updated version on this
                page with a revised "last updated" date. Continued use of the Service after changes
                constitutes acceptance of the revised Terms.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">14. Contact</h2>
              <p>
                Questions about these Terms? Email us at care@kabirclothing.example.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
