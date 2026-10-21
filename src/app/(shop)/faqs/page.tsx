import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata = { title: 'FAQs', description: 'Frequently asked questions about Kabir Clothing.' }

const FAQS = [
  {
    q: 'What sizes do you offer?',
    a: 'Most of our tops come in XS, S, M, L, and XL. Our trousers and jeans come in waist sizes 30, 32, 34, and 36. Each product page has a detailed fit guide and model measurements to help you choose.',
  },
  {
    q: 'How should I care for my Kabir pieces?',
    a: 'Each product includes specific care instructions on its page. As a general rule, wash cotton and linen cold inside-out, hang to dry, and iron warm. For selvedge denim, wash sparingly — every 10–15 wears is plenty.',
  },
  {
    q: 'How long will my order take to arrive?',
    a: 'Orders are typically dispatched within 1–2 business days. Once shipped, deliveries within India take 3–7 business days depending on your location. You will receive a tracking number by email once your order ships.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'We currently ship within India only. International shipping is on our roadmap — sign up for the newsletter to be notified when it launches.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 7 days of delivery for unworn, unwashed items with all tags attached. Some items (such as innerwear and accessories) are non-returnable for hygiene reasons. Please see our Returns & Refunds page for full details.',
  },
  {
    q: 'How do refunds work?',
    a: 'Once we receive and inspect your return, refunds are processed to the original payment method within 5–7 business days. The exact time depends on your bank or card issuer.',
  },
  {
    q: 'Are your products made in India?',
    a: 'Yes. Every Kabir piece is designed and manufactured in our workshop in India. We work with local fabric mills and finish every piece by hand.',
  },
  {
    q: 'Why are your prices in INR?',
    a: 'We are an Indian brand and our prices are set in Indian Rupees. Taxes are included in the displayed price — there are no surprise charges at checkout.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. Payments are processed by Razorpay, a PCI-DSS compliant payment gateway. Your card details never touch our servers. We never store CVVs or full card numbers.',
  },
  {
    q: 'How do I track my order?',
    a: 'Sign in to your account and visit the Orders page to see real-time status. Once your order ships, you will also receive an email with the tracking number and a link to the carrier\'s tracking page.',
  },
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-kabir py-12 lg:py-20 max-w-3xl">
          <p className="text-[11px] tracking-eyebrow uppercase text-accent-foreground mb-3">Help center</p>
          <h1 className="font-serif text-4xl lg:text-5xl tracking-display mb-3">Frequently asked questions</h1>
          <p className="text-foreground/70 mb-10 max-w-xl">
            Quick answers to the questions we hear most. Can't find what you're looking for? Visit our
            contact page and send us a message.
          </p>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border bg-card px-5">
                <AccordionTrigger className="text-base font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  )
}
