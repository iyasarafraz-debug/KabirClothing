import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'

export const metadata = { title: 'Privacy Policy', description: 'Privacy policy for Kabir Clothing.' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20 max-w-3xl">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Legal</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-3">Privacy Policy</h1>
          <p className="text-sm text-foreground/60 mb-10">Last updated: October 2025</p>

          <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">1. Introduction</h2>
              <p>
                Kabir Clothing ("we", "us", "our") respects your privacy and is committed to
                protecting your personal information. This policy explains what we collect, how we use
                it, and the choices you have. By using our website, you agree to the practices
                described here.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">2. Information we collect</h2>
              <p>We collect the following categories of information:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Account information:</strong> name, email address, and password (stored as a one-way hash) when you create an account.</li>
                <li><strong>Order information:</strong> shipping address, phone number, and order history when you place an order.</li>
                <li><strong>Payment information:</strong> processed securely by Razorpay. We never receive or store your full card number or CVV.</li>
                <li><strong>Communication:</strong> messages you send us via our contact form or email.</li>
                <li><strong>Usage data:</strong> anonymised analytics about pages visited and interactions on our site.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">3. How we use your information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To process and ship your orders, and provide order status updates.</li>
                <li>To respond to your enquiries and provide customer support.</li>
                <li>To send you marketing emails if you have subscribed to our newsletter (you can unsubscribe at any time).</li>
                <li>To improve our products, website, and services.</li>
                <li>To detect and prevent fraud, abuse, and unauthorised access.</li>
                <li>To comply with applicable laws and regulations.</li>
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">4. Information sharing</h2>
              <p>
                We do not sell your personal information. We share it only with service providers who
                help us run our business (such as payment processors, shipping carriers, and email
                providers), and only to the extent necessary to provide their services. These
                providers are bound by confidentiality obligations.
              </p>
              <p className="mt-2">
                We may disclose information when required by law, court order, or to protect our
                rights, property, or safety.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">5. Data security</h2>
              <p>
                We use industry-standard practices to protect your information: encrypted HTTPS
                connections, hashed passwords, secure session cookies, and access controls. No
                method of transmission or storage is 100% secure, but we work hard to safeguard your
                data.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">6. Your rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Access the personal information we hold about you.</li>
                <li>Request correction of inaccurate information.</li>
                <li>Request deletion of your account and associated data, subject to legal retention requirements.</li>
                <li>Opt out of marketing communications at any time.</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, contact us at care@kabirclothing.example.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">7. Cookies</h2>
              <p>
                We use cookies for session management, cart persistence, and basic analytics. You can
                control cookies through your browser settings. Disabling cookies may affect some
                site functionality (such as staying logged in or keeping items in your cart).
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">8. Children's privacy</h2>
              <p>
                Our website is not intended for individuals under the age of 18. We do not knowingly
                collect personal information from children.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">9. Changes to this policy</h2>
              <p>
                We may update this policy from time to time. We will post the updated version on this
                page with a revised "last updated" date. Material changes will be communicated via
                email if you have an account with us.
              </p>
            </section>
            <section>
              <h2 className="font-serif text-2xl mb-3 text-foreground">10. Contact</h2>
              <p>
                Questions about this policy? Email us at care@kabirclothing.example or write to us at
                our workshop address listed on the Contact page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
