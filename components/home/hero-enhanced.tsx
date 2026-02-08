"use client"

import { useLanguage } from "@/lib/language-context"
import { ArrowRight, Phone, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const translations = {
    uz: {
        headline: "Urganchdagi eng mazali Sushi va Shashliklar",
        subtext: "Milliy va Yevropa taomlari • Tez yetkazib berish • Shinam muhit",
        primaryCta: "Menyuni ko'rish",
        secondaryCta: "Buyurtma berish",
    },
    ru: {
        headline: "Самые вкусные Суши и Шашлыки в Ургенче",
        subtext: "Национальная и Европейская кухня • Быстрая доставка • Уютная атмосфера",
        primaryCta: "Посмотреть Меню",
        secondaryCta: "Заказать доставку",
    },
    en: {
        headline: "The most delicious Sushi and Kebabs in Urgench",
        subtext: "National and European cuisine • Fast delivery • Cozy atmosphere",
        primaryCta: "View Menu",
        secondaryCta: "Order Delivery",
    },
}

export function HeroEnhanced() {
    const { language } = useLanguage()
    const t = translations[language]

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url(/tokyo-restaurant-night.png)",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />
            </div>

            <div className="container relative z-10 px-4 text-center max-w-4xl mx-auto pt-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs md:text-sm font-medium mb-6 animate-fade-in backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    09:00 - 23:00
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-xl text-balance">
                    {t.headline}
                </h1>

                <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t.subtext}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Button
                        asChild
                        size="lg"
                        className="w-full sm:w-auto h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold shadow-lg shadow-amber-500/30 px-8"
                    >
                        <Link href="/menu">
                            {t.primaryCta} <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-14 rounded-full border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 text-lg font-medium px-8"
                    >
                        <a href="tel:+998914331110">
                            <Phone className="w-5 h-5 mr-2" /> {t.secondaryCta}
                        </a>
                    </Button>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center p-1">
                    <div className="w-1 h-2 bg-white rounded-full"></div>
                </div>
            </div>
        </section>
    )
}
