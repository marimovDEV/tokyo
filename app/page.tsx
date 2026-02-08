"use client"

import { Header } from "@/components/layout/header"
import { HeroEnhanced } from "@/components/home/hero-enhanced"
import { TrustSection } from "@/components/home/trust-section"
import { PopularDishesSection } from "@/components/home/popular-dishes"
import { PromotionsCarousel } from "@/components/promotions-carousel"
import { FloatingButtons } from "@/components/layout/floating-buttons"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export default function Home() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-slate-900 pb-16 md:pb-0">
      <Header />

      <HeroEnhanced />

      <TrustSection />

      <PopularDishesSection />

      {/* Promotions Section - keeping reused component */}
      <section className="py-16 bg-slate-900 relative">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {language === 'uz' ? "Aksiyalar" : language === 'ru' ? "Акции" : "Promotions"}
              </h2>
              <p className="text-white/60">
                {language === 'uz' ? "Maxsus takliflarimiz" : language === 'ru' ? "Наши специальные предложения" : "Our special offers"}
              </p>
            </div>
          </div>
          <PromotionsCarousel language={language} />
        </div>
      </section>

      {/* Extra CTA for Menu */}
      <section className="py-20 bg-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/tokyo-pattern.png')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {language === 'uz' ? "Qorni och qoldingizmi?" : language === 'ru' ? "Проголодались?" : "Hungry?"}
          </h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            {language === 'uz'
              ? "Hoziroq buyurtma bering va mazali taomlardan bahramand bo'ling"
              : language === 'ru'
                ? "Закажите сейчас и наслаждайтесь вкусной едой"
                : "Order now and enjoy delicious food"}
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-colors shadow-xl"
          >
            {language === 'uz' ? "Menyuga o'tish" : language === 'ru' ? "Перейти в меню" : "Go to Menu"}
          </Link>
        </div>
      </section>

      <FloatingButtons />
      <MobileNav />
    </main>
  )
}
