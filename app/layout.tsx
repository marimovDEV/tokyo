import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"
import { MenuProvider } from "@/lib/menu-context"
import { CartProvider } from "@/lib/cart-context"
import { FeedbackProvider } from "@/lib/feedback-context"
import { LanguageProvider } from "@/lib/language-context"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://tokyokafe.uz'),
  title: "Tokyo Kafe — Sushi, Rolls va Yapon Taomlari",
  description: "Yapon oshxonasining eng mazali sushi, rolls va ramenlarini tatib ko'ring! Faqat Tokyo Kafe'da — sifat, lazzat va shinam muhit bir joyda.",
  keywords: [
    "tokyo kafe",
    "sushi",
    "rolls", 
    "ramen",
    "yapon taomlari",
    "yapon restorani",
    "toshkent",
    "uzbekistan",
    "sushi bar",
    "yapon oshxonasi",
    "fresh sushi",
    "delicious rolls",
    "authentic ramen"
  ],
  authors: [{ name: "Tokyo Kafe" }],
  creator: "Tokyo Kafe",
  publisher: "Tokyo Kafe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://tokyokafe.uz",
    siteName: "Tokyo Kafe",
    title: "Tokyo Kafe — Sushi, Rolls va Yapon Taomlari",
    description: "Yapon oshxonasining eng mazali sushi, rolls va ramenlarini tatib ko'ring! Faqat Tokyo Kafe'da — sifat, lazzat va shinam muhit bir joyda.",
    images: [
      {
        url: "https://tokyokafe.uz/static/images/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Tokyo Kafe - Yapon Taomlari",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tokyokafe",
    creator: "@tokyokafe",
    title: "Tokyo Kafe — Sushi, Rolls va Yapon Taomlari",
    description: "Yapon oshxonasining eng mazali sushi, rolls va ramenlarini tatib ko'ring! Faqat Tokyo Kafe'da — sifat, lazzat va shinam muhit bir joyda.",
    images: ["https://tokyokafe.uz/static/images/preview.jpg"],
  },
  alternates: {
    canonical: "https://tokyokafe.uz",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tokyo Kafe" />
        <link rel="apple-touch-icon" href="/static/images/preview.jpg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <LanguageProvider>
          <MenuProvider>
            <CartProvider>
              <FeedbackProvider>
                <Suspense fallback={null}>{children}</Suspense>
                <Toaster />
                <Analytics />
              </FeedbackProvider>
            </CartProvider>
          </MenuProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
