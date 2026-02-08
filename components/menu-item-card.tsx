import { useState, useRef, useEffect } from "react"
import { Star, Plus, Minus, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductModal } from "@/components/product-modal"
import type { MenuItem } from "@/lib/types"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/api"

interface MenuItemCardProps {
  item: MenuItem
  language: "uz" | "ru" | "en"
}

export function MenuItemCard({ item, language }: MenuItemCardProps) {
  const { cart, addToCart, updateQuantity } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const cartItem = cart.find((ci) => ci.menuItem.id === item.id)
  const quantity = cartItem?.quantity || 0

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const getName = () => {
    if (language === "uz") return item.name_uz
    if (language === "ru") return item.name_ru
    return item.name
  }





  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)

    // Simulate network delay for better UX
    setTimeout(() => {
      addToCart(item)
      setIsLoading(false)
      setIsSuccess(true)
    }, 600)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(item)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  const openModal = () => setIsModalOpen(true)

  return (
    <>
      <div
        data-menu-item-id={item.id}
        onClick={openModal}
        className="group bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/30 h-full flex flex-col cursor-pointer"
      >
        {/* Image Section - 4:3 on mobile, 1:1 on desktop */}
        <div className="relative aspect-[4/3] md:aspect-square w-full overflow-hidden">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={getName()}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/70 backdrop-blur-md px-2 py-1 md:px-2.5 md:py-1.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-orange-400 text-orange-400" />
            <span className="text-white font-semibold text-xs md:text-sm">{item.rating}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-3 md:p-5">
          {/* Title */}
          <h3 className="text-sm md:text-lg font-bold text-white mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-orange-400 transition-colors h-[40px] md:h-auto">
            {getName()}
          </h3>

          {/* Description hidden on mobile */}
          <div className="hidden md:block mb-4">
            <p className="text-xs text-white/60 line-clamp-2">
              {language === "uz" ? item.description_uz : language === "ru" ? item.description_ru : item.description}
            </p>
          </div>

          {/* Price and Add Button - Bottom aligned */}
          <div className="flex items-center justify-between gap-2 md:gap-4 pt-2 md:pt-4 border-t border-white/10 mt-auto">
            <div className="text-base md:text-xl font-bold text-orange-400">
              {formatPrice(item.price)}
            </div>

            {quantity === 0 ? (
              <Button
                onClick={handleAddToCart}
                disabled={!item.available || isLoading}
                className={`
                bg-gradient-to-r hover:to-orange-700 text-white rounded-full
                h-8 px-0 w-8 md:w-auto md:h-11 md:px-6 
                font-semibold shadow-lg transition-all duration-200
                flex items-center justify-center
                ${isSuccess
                    ? "from-green-500 to-green-600 hover:from-green-600 shadow-green-500/30"
                    : "from-orange-500 to-orange-600 hover:from-orange-600 shadow-orange-500/30 hover:shadow-orange-500/50"
                  }
              `}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : isSuccess ? (
                  <Check className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 md:hidden" />
                    <span className="hidden md:inline">
                      {language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}
                    </span>
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-1 md:gap-2 bg-white/10 rounded-full p-0.5 md:p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDecrement}
                  className="h-7 w-7 md:h-9 md:w-9 rounded-full hover:bg-white/20 text-white transition-all duration-200"
                >
                  <Minus className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <span className="text-white font-semibold w-5 md:w-8 text-center text-sm md:text-base">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleIncrement}
                  className="h-7 w-7 md:h-9 md:w-9 rounded-full hover:bg-white/20 text-white transition-all duration-200"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductModal
        item={item}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        language={language}
      />
    </>
  )
}
