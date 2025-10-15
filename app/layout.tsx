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
  title: "TOKYO Restaurant - Haqiqiy Yapon Ta'mlari",
  description: "Yangi ingredientlar, haqiqiy yapon ta'mlar. Toshkent shahridagi eng yaxshi yapon restorani.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
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
