"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Search, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMenu } from "@/lib/menu-context"
import { useCart } from "@/lib/cart-context"
import { MenuItemCard } from "@/components/menu-item-card"
import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/types"
import { PromotionsCarousel } from "@/components/promotions-carousel"

export default function MenuPage() {
  const { language, setLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { categories, menuItems, loading } = useMenu()
  const { getTotalItems } = useCart()

  const filteredItems = useMemo(() => {
    // Agar loading yoki menuItems yo'q bo'lsa, bo'sh array qaytarish
    if (loading || !menuItems || !Array.isArray(menuItems)) {
      return []
    }

    let items = menuItems

    if (selectedCategory) {
      // Convert both to numbers for comparison to handle type mismatches
      const selectedCategoryId = parseInt(selectedCategory)
      items = items.filter((item) => {
        const itemCategoryId = parseInt(item.category.toString())
        return itemCategoryId === selectedCategoryId
      })
    }

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name_ru.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return items
  }, [menuItems, selectedCategory, searchQuery, loading])

  const totalCartItems = getTotalItems()

  // Loading holati
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-24">
      <div className="fixed inset-0 bg-[url('/tokyo-restaurant-night.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </Link>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white">Menu</h1>
          </div>

          <div className="flex gap-1 md:gap-1 bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/20">
            {(["uz", "ru", "en"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                  language === lang ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
                ))}
              </div>
            </div>

        <PromotionsCarousel language={language} />

        {/* Search */}
        <div className="mb-6 md:mb-8 px-2 md:px-0">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/60" />
            <Input
              placeholder={
                language === "uz" ? "Taom qidirish..." : language === "ru" ? "Поиск блюд..." : "Search dishes..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 md:pl-12 bg-white/10 backdrop-blur-xl border-white/30 text-white placeholder:text-white/60 h-12 md:h-14 rounded-xl md:rounded-2xl text-sm md:text-base"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 md:mb-8 flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin px-2 md:px-0">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? "default" : "outline"}
            className={`rounded-full whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5 ${
              selectedCategory === null
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                : "bg-white/10 backdrop-blur-xl border-white/30 text-white hover:bg-white/20"
            }`}
          >
            {language === "uz" ? "Hammasi" : language === "ru" ? "Все" : "All"}
          </Button>
          {categories && Array.isArray(categories) && categories
            .map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full whitespace-nowrap text-xs md:text-sm px-3 md:px-4 py-2 md:py-2.5 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    : "bg-white/10 backdrop-blur-xl border-white/30 text-white hover:bg-white/20"
                }`}
              >
                {language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name}
              </Button>
            ))}
          </div>

        {/* Menu Items Grid - Optimized for laptop screens */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 px-2 md:px-0">
              {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} language={language} />
            ))}
                  </div>
            </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-16">
            <p className="text-white/60 text-lg">
              {language === "uz" ? "Hech narsa topilmadi" : language === "ru" ? "Ничего не найдено" : "No items found"}
            </p>
                  </div>
        )}
      </div>

      {totalCartItems > 0 && (
        <Link href="/cart">
          <Button className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full h-16 px-8 shadow-2xl shadow-amber-500/50 flex items-center gap-3 text-lg font-semibold">
            <ShoppingCart className="w-6 h-6" />
            <span>{language === "uz" ? "Savat" : language === "ru" ? "Корзина" : "Cart"}</span>
            <Badge className="bg-white text-amber-600 font-bold text-base h-8 w-8 flex items-center justify-center p-0 rounded-full">
              {totalCartItems}
            </Badge>
          </Button>
        </Link>
      )}
    </div>
  )
}
