import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Kabir Clothing — Premium Contemporary Fashion",
    template: "%s — Kabir Clothing",
  },
  description:
    "Kabir Clothing is a premium contemporary Indian fashion house. Minimal luxury, modern streetwear, and elevated everyday essentials. Designed in India.",
  keywords: [
    "Kabir Clothing",
    "premium fashion",
    "Indian streetwear",
    "minimal luxury",
    "contemporary menswear",
    "t-shirts",
    "shirts",
    "hoodies",
    "trousers",
    "denim",
  ],
  authors: [{ name: "Kabir Clothing" }],
  creator: "Kabir Clothing",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Kabir Clothing — Premium Contemporary Fashion",
    description:
      "Minimal luxury, modern streetwear, and elevated everyday essentials. Designed in India.",
    url: "/",
    siteName: "Kabir Clothing",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kabir Clothing",
    description: "Premium contemporary fashion. Designed in India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
