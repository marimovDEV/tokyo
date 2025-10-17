"use client"

import { useMenu } from "@/lib/menu-context"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/lib/types"

interface PromotionsCarouselProps {
  language: Language
}

export function PromotionsCarousel({ language }: PromotionsCarouselProps) {
  const { promotions, loading } = useMenu()
  const { addPromotionToCart } = useCart()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Active promotions ni hisoblash
  const activePromotions = promotions && Array.isArray(promotions) 
    ? promotions.filter((promo) => promo.is_active) 
    : []

  // Avtomatik aylanish (har 3 soniyada)
  useEffect(() => {
    if (activePromotions.length <= 1) return

    console.log('Starting auto-rotation for carousel, promotions count:', activePromotions.length)

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % activePromotions.length
        console.log('Auto-rotating carousel, prev:', prev, 'next:', nextIndex)
        return nextIndex
      })
    }, 3000)

    return () => {
      console.log('Clearing carousel auto-rotation interval')
      clearInterval(interval)
    }
  }, [activePromotions.length])

  // Menu section'ga scroll qilish funksiyasi
  const scrollToMenu = () => {
    // Menu sahifasida menu items grid'ni topadi
    const menuGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-3')
    if (menuGrid) {
      menuGrid.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Promotion'ni savatga qo'shish funksiyasi
  const handleAddPromotionToCart = () => {
    if (currentPromotion) {
      addPromotionToCart(currentPromotion)
    }
  }

  // Loading yoki promotions yo'q bo'lsa
  if (loading || !promotions || !Array.isArray(promotions)) return null

  if (activePromotions.length === 0) return null

  const currentPromotion = activePromotions[currentIndex]
  
  // Agar currentPromotion yo'q bo'lsa
  if (!currentPromotion) return null

  const nextPromotion = () => {
    setCurrentIndex((prev) => (prev + 1) % activePromotions.length)
  }

  const prevPromotion = () => {
    setCurrentIndex((prev) => (prev - 1 + activePromotions.length) % activePromotions.length)
  }

  const getTitle = () => {
    if (language === "uz") return currentPromotion.title_uz || currentPromotion.titleUz
    if (language === "ru") return currentPromotion.title_ru || currentPromotion.titleRu
    return currentPromotion.title
  }

  const getDescription = () => {
    if (language === "uz") return currentPromotion.description_uz || currentPromotion.descriptionUz
    if (language === "ru") return currentPromotion.description_ru || currentPromotion.descriptionRu
    return currentPromotion.description
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-xl">
          <div className="relative h-48 md:h-64">
            <Image src={currentPromotion.image || "/placeholder.svg"} alt={getTitle()} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {(currentPromotion.discount_percentage > 0 || currentPromotion.discount_amount > 0) && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-xl font-bold shadow-lg">
                {currentPromotion.discount_percentage > 0 && `-${currentPromotion.discount_percentage}%`}
                {currentPromotion.discount_percentage === 0 && currentPromotion.discount_amount > 0 && 
                  `-${currentPromotion.discount_amount.toLocaleString()} so'm`
                }
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{getTitle()}</h3>
              <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-4">{getDescription()}</p>
              
              {/* Tugmalar */}
              <div className="flex gap-3">
                <Button 
                  onClick={scrollToMenu}
                  size="sm"
                  className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 rounded-full text-sm font-semibold flex-1"
                >
                  {language === "uz" ? "Ko'rish" : language === "ru" ? "Смотреть" : "View"}
                </Button>
                
                <Button 
                  onClick={handleAddPromotionToCart}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-sm font-semibold shadow-lg shadow-amber-500/30 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {activePromotions.length > 1 && (
          <>
            <Button
              onClick={prevPromotion}
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Button>
            <Button
              onClick={nextPromotion}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {activePromotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-amber-500 w-8" : "bg-white/30 w-2"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
