"use client"

import { useMenu } from "@/lib/menu-context"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Language } from "@/lib/types"

export function PromotionsSection() {
  const { promotions, loading } = useMenu()
  const [language, setLanguage] = useState<Language>("uz")
  const [currentIndex, setCurrentIndex] = useState(0)

  // Active promotions ni hisoblash (useMemo bilan optimizatsiya)
  const activePromotions = useMemo(() => {
    return promotions && Array.isArray(promotions) 
      ? promotions.filter((promo) => promo.is_active) 
      : []
  }, [promotions])

  // Avtomatik aylanish (har 4 soniyada, yumshoq transition)
  useEffect(() => {
    if (activePromotions.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % activePromotions.length
        return nextIndex
      })
    }, 4000)

    return () => {
      clearInterval(interval)
    }
  }, [activePromotions.length])

  // Menu sahifasiga o'tish funksiyasi
  const scrollToMenu = () => {
    // Bosh sahifadan menu sahifasiga o'tish
    window.location.href = '/menu'
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
    <section className="py-16 px-4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-3 mb-12">
          <Tag className="w-8 h-8 text-amber-400" />
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            {language === "uz" ? "Aksiyalar" : language === "ru" ? "Акции" : "Promotions"}
          </h2>
        </div>

        <div className="relative">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative h-64 md:h-96">
                <Image
                  src={currentPromotion.image || "/placeholder.svg"}
                  alt={getTitle()}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                  priority={currentIndex === 0}
                />
                {/* AKSIYA Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  AKSIYA
                </div>
                
                {(currentPromotion.discount_percentage > 0 || currentPromotion.discount_amount > 0) && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                    {currentPromotion.discount_percentage > 0 && `-${currentPromotion.discount_percentage}%`}
                    {currentPromotion.discount_percentage === 0 && currentPromotion.discount_amount > 0 && 
                      `-${currentPromotion.discount_amount.toLocaleString()} so'm`
                    }
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{getTitle()}</h3>
                <p className="text-lg text-white/80 mb-6 leading-relaxed">{getDescription()}</p>

                <div className="flex items-center gap-4 text-sm text-white/60 mb-8">
                  <div>
                    <span className="font-semibold">
                      {language === "uz" ? "Boshlanish:" : language === "ru" ? "Начало:" : "Start:"}
                    </span>{" "}
                    {currentPromotion.start_date ? new Date(currentPromotion.start_date).toLocaleDateString() : 'Belgilanmagan'}
                  </div>
                  <div>
                    <span className="font-semibold">
                      {language === "uz" ? "Tugash:" : language === "ru" ? "Конец:" : "End:"}
                    </span>{" "}
                    {currentPromotion.end_date ? new Date(currentPromotion.end_date).toLocaleDateString() : 'Belgilanmagan'}
                  </div>
                </div>

                <Button 
                  onClick={scrollToMenu}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full h-14 text-lg font-semibold shadow-lg shadow-amber-500/30 w-full md:w-auto"
                >
                  {language === "uz" ? "Ko'rish" : language === "ru" ? "Смотреть" : "View"}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {activePromotions.length > 1 && (
            <>
              <Button
                onClick={prevPromotion}
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30 hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
              <Button
                onClick={nextPromotion}
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/30 border border-white/30 hidden md:flex"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </Button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {activePromotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex ? "bg-amber-500 w-8" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  )
}
