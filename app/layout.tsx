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
  title: "Tokyo Kafe 🍣 Urganch — Sushi, Shashlik va Ichimliklar",
  description: "Tokyo Kafe — Urganch shahridagi zamonaviy restoran 🍣. Sushi, shashlik, gamburger va ichimliklar bilan xizmatdamiz. Yetkazib berish xizmati: +998914331110. Ish vaqti: 09:00–02:00.",
  keywords: "Tokyo Kafe Urganch, sushi Urganch, shashlik Xorazm, restoran Urganch, ichimliklar Urganch, sushi yetkazib berish, Tokyo sushi",
  authors: [{ name: "Tokyo Kafe Urganch" }],
  openGraph: {
    title: "Tokyo Kafe Urganch 🍣",
    description: "Urganchdagi eng mazali sushi va shashliklar. Ish vaqti 09:00–02:00. Tel: +998914331110",
    url: "https://tokyokafe.uz/",
    siteName: "Tokyo Kafe Urganch",
    images: [
      {
        url: "https://tokyokafe.uz/static/images/preview.webp",
        width: 1200,
        height: 630,
        alt: "Tokyo Kafe Urganch",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tokyo Kafe Urganch 🍣",
    description: "Sushi, shashlik, ichimliklar va tez yetkazib berish Xorazmda.",
    images: ["https://tokyokafe.uz/static/images/preview.webp"],
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
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Tokyo Kafe Urganch",
    "image": "https://tokyokafe.uz/static/images/preview.webp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "улица Байналминал, 29",
      "addressLocality": "Ургенч",
      "addressRegion": "Хорезмская область",
      "postalCode": "220100",
      "addressCountry": "UZ"
    },
    "telephone": "+998914331110",
    "openingHours": "Mo-Su 09:00-02:00",
    "servesCuisine": ["Japanese", "Uzbek", "European"],
    "priceRange": "$$",
    "menu": "https://tokyokafe.uz/menu",
    "url": "https://tokyokafe.uz",
    "sameAs": [
      "https://www.instagram.com/tokyo.urgench"
    ]
  }

  return (
    <html lang="uz">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="canonical" href="https://tokyokafe.uz/" />
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
