"use client"

import { useRef, useEffect } from "react"

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
    // 1. Group active & available items by category
    // 2. Pick the highest rated item from each category to ensure diversity
    // 3. Flatten and slice to take top 6
    const popularItems = (() => {
        if (!menuItems) return []

        // Group by category
        const itemsByCategory: Record<string, typeof menuItems> = {}

        menuItems.forEach(item => {
            if (item.is_active && item.available) {
                const catId = String(item.category)
                if (!itemsByCategory[catId]) {
                    itemsByCategory[catId] = []
                }
                itemsByCategory[catId].push(item)
            }
        })

        // Pick top rated from each category
        const selectedItems: typeof menuItems = []

        Object.values(itemsByCategory).forEach(categoryItems => {
            // Sort by rating desc
            const sorted = categoryItems.sort((a, b) => (b.rating || 0) - (a.rating || 0))
            if (sorted.length > 0) {
                selectedItems.push(sorted[0])
            }
        })

        // Sort the final selection by global rating or just shuffle/slice
        // Let's sort by rating to show the best of the best from different categories
        return selectedItems.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
    })()

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Auto-scroll logic for mobile/tablet
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) return

        const interval = setInterval(() => {
            // Only auto-scroll if it's in carousel mode (flex)
            // We can check if display is flex or simply check window width
            if (window.innerWidth >= 1024) return // lg breakpoint

            if (scrollContainer) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainer

                // If we are at the end (or close to it), loop back to start
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainer.scrollTo({ left: 0, behavior: "smooth" })
                } else {
                    // Scroll by one item width (approx 45vw or half container)
                    scrollContainer.scrollBy({ left: clientWidth * 0.5, behavior: "smooth" })
                }
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [])

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

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory -mx-4 px-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:pb-0 lg:mx-0 lg:px-0 scrollbar-hide"
                >
                    {popularItems.map((item, idx) => (
                        <div key={item.id} className="min-w-[75vw] sm:min-w-[45vw] lg:min-w-0 snap-center animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <MenuItemCard item={item} language={language} />
                        </div>
                    ))}
                </div>

                <div className="text-center animate-fade-in-up delay-500 hidden lg:block">
                    <Button asChild size="lg" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-8">
                        <Link href="/menu">
                            {t.viewAll} <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>

                {/* Mobile View All Button - visible below carousel */}
                <div className="text-center animate-fade-in-up delay-500 lg:hidden mt-4">
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
