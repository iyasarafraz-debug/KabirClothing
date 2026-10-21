import Link from 'next/link'
import { Header } from '@/components/shop/header'
import { Footer } from '@/components/shop/footer'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container-kabir py-20 text-center max-w-md">
          <p className="font-serif text-[120px] lg:text-[180px] leading-none tracking-display text-accent">404</p>
          <p className="text-[11px] tracking-eyebrow uppercase text-foreground/60 mt-2 mb-6">Page not found</p>
          <h1 className="font-serif text-3xl lg:text-4xl tracking-display mb-4">
            This page seems to have gone off the rack.
          </h1>
          <p className="text-foreground/60 mb-8">
            The page you are looking for doesn't exist or has been moved. Let's get you back to the
            collection.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="bg-kabir-black text-kabir-ivory hover:bg-kabir-charcoal">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Shop all</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
