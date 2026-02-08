"use client"

import { useRef, useEffect } from "react"
import { useMenu } from "@/lib/menu-context"
import { useLanguage } from "@/lib/language-context"
import { MenuItemCard } from "@/components/menu-item-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Loader2, Heart } from "lucide-react"

const translations = {
    uz: {
        title: "Tavsiya etamiz",
        subtitle: "Maxsus tanlab olingan eng mazali taomlarimiz",
        viewAll: "Barchasini ko'rish",
    },
    ru: {
        title: "Рекомендуем",
        subtitle: "Наши самые вкусные и специально отобранные блюда",
        viewAll: "Посмотреть все",
    },
    en: {
        title: "Recommended",
        subtitle: "Our most delicious and specially selected dishes",
        viewAll: "View All",
    },
}

export function RecommendedDishesSection() {
    const { menuItems, loading } = useMenu()
    const { language } = useLanguage()
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const t = translations[language]

    // Logic: Diverse high-rated items, excluding ones likely in "Popular" if possible
    // For now, let's just pick top rated from each category similar to popular, 
    // but maybe the 2nd best to ensure variety? 
    // No, let's just pick top 6 items by global_order if available, otherwise rating.
    const recommendedItems = (() => {
        if (!menuItems) return []

        // Filter active & available
        const activeItems = menuItems.filter(item => item.is_active && item.available)

        // Strategy: Sort by rating, then skip top 3 (to avoid too much overlap with Popular)
        // Or just pick items with unique vibes.
        return activeItems
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(3, 9) // Take 6 items after the top 3
    })()

    // Auto-scroll logic for mobile/tablet
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer || recommendedItems.length <= 1) return

        const interval = setInterval(() => {
            if (window.innerWidth >= 1024) return // lg breakpoint

            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer

            if (scrollLeft + clientWidth >= scrollWidth - 10) {
                scrollContainer.scrollTo({ left: 0, behavior: "smooth" })
            } else {
                scrollContainer.scrollBy({ left: clientWidth * 0.5, behavior: "smooth" })
            }
        }, 3500)

        return () => clearInterval(interval)
    }, [recommendedItems.length])

    if (loading) return null // Handled by other sections or parent

    if (recommendedItems.length === 0) return null

    return (
        <section className="py-16 md:py-24 bg-slate-800/50 border-b border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">Chef's Choice</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t.title}
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        {t.subtitle}
                    </p>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory -mx-4 px-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:pb-0 lg:mx-0 lg:px-0 scrollbar-hide"
                >
                    {recommendedItems.map((item, idx) => (
                        <div key={item.id} className="min-w-[75vw] sm:min-w-[45vw] lg:min-w-0 snap-center animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <MenuItemCard item={item} language={language} />
                        </div>
                    ))}
                </div>

                <div className="text-center animate-fade-in-up delay-500 mt-12 lg:hidden">
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
