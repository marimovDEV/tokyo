import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tokyo Restaurant - O'zbek Milliy Oshxonasi",
  description: "Tokyo restorani - O'zbek milliy oshxonasining eng mazali taomlarini tatib ko'ring. Shahardagi eng yaxshi restoran.",
  keywords: "restoran, o'zbek oshxonasi, tokyo, taom, ovqat, tashkent",
  authors: [{ name: "Tokyo Restaurant" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "Tokyo Restaurant",
    description: "O'zbek milliy oshxonasining eng mazali taomlarini tatib ko'ring",
    images: ['/logo.png'],
    type: 'website',
    locale: 'uz_UZ',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <meta name="theme-color" content="#15803d" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <LanguageProvider>
          <ToastProvider>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              {children}
            </Suspense>
          </ToastProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
