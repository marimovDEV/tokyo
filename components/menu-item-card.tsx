import { useState, useEffect } from "react"
import { Star, Plus, Minus, Check, Loader2 } from "lucide-react"
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
        className="group bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/30 h-full flex flex-col cursor-pointer"
      >
        {/* Image Section - 1:1 Aspect Ratio */}
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={getName()}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span className="text-white font-semibold text-sm">{item.rating}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-5 min-[431px]:p-3 md:p-5">
          {/* Title */}
          <h3 className="text-lg min-[431px]:text-base md:text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
            {getName()}
          </h3>

          {/* Description and other details hidden to reduce noise */}

          {/* Price and Add Button - Bottom aligned */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 mt-auto">
            <div className="text-xl min-[431px]:text-lg md:text-xl font-bold text-orange-400">
              {formatPrice(item.price)}
            </div>

            {quantity === 0 ? (
              <Button
                onClick={handleAddToCart}
                disabled={!item.available || isLoading}
                className={`
                bg-gradient-to-r hover:to-orange-700 text-white rounded-full h-11 min-[431px]:h-9 md:h-11 px-6 min-[431px]:px-4 md:px-6 text-base min-[431px]:text-sm md:text-base font-semibold shadow-lg transition-all duration-200 min-w-[100px] min-[431px]:min-w-[80px] md:min-w-[100px]
                ${isSuccess
                    ? "from-green-500 to-green-600 hover:from-green-600 shadow-green-500/30"
                    : "from-orange-500 to-orange-600 hover:from-orange-600 shadow-orange-500/30 hover:shadow-orange-500/50"
                  }
              `}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDecrement}
                  className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-200"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white font-semibold w-8 text-center text-base">{quantity}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleIncrement}
                  className="h-9 w-9 rounded-full hover:bg-white/20 text-white transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
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
