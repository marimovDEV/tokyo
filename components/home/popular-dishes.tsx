"use client"

import { useMenu } from "@/lib/menu-context"
import { useLanguage } from "@/lib/language-context"
import { MenuItemCard } from "@/components/menu-item-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"

const translations = {
    uz: {
        title: "Mashhur taomlar",
        subtitle: "Mijozlarimiz eng ko'p tanlagan sevimli taomlar",
        viewAll: "Barchasini ko'rish",
    },
    ru: {
        title: "Популярные блюда",
        subtitle: "Любимые блюда наших клиентов",
        viewAll: "Посмотреть все",
    },
    en: {
        title: "Popular Dishes",
        subtitle: "Favorite dishes chosen by our customers",
        viewAll: "View All",
    },
}

export function PopularDishesSection() {
    const { menuItems, loading } = useMenu()
    const { language } = useLanguage()
    const t = translations[language]

    // Strategy: 
    // 1. Filter active & available items
    // 2. Sort by rating (desc)
    // 3. Take top 6
    const popularItems = menuItems
        ?.filter(item => item.is_active && item.available)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6) || []

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-b border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                </div>
            </section>
        )
    }

    if (popularItems.length === 0) return null

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-b border-white/5 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                        {t.title}
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto animate-fade-in-up delay-100">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                    {popularItems.map((item, idx) => (
                        <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <MenuItemCard item={item} language={language} />
                        </div>
                    ))}
                </div>

                <div className="text-center animate-fade-in-up delay-500">
                    <Button asChild size="lg" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-8">
                        <Link href="/menu">
                            {t.viewAll} <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
