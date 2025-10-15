"use client"
import Image from "next/image"
import { Star, Clock, Weight, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MenuItem } from "@/lib/types"
import { useCart } from "@/lib/cart-context"

interface MenuItemCardProps {
  item: MenuItem
  language: "uz" | "ru" | "en"
}

export function MenuItemCard({ item, language }: MenuItemCardProps) {
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find((ci) => ci.menuItem.id === item.id)
  const quantity = cartItem?.quantity || 0

  const getName = () => {
    if (language === "uz") return item.nameUz
    if (language === "ru") return item.nameRu
    return item.name
  }

  const getDescription = () => {
    if (language === "uz") return item.descriptionUz
    if (language === "ru") return item.descriptionRu
    return item.description
  }

  const getIngredients = () => {
    if (language === "uz") return item.ingredientsUz || []
    if (language === "ru") return item.ingredientsRu || []
    return item.ingredients || []
  }

  const handleAddToCart = () => {
    addToCart(item)
  }

  const handleIncrement = () => {
    addToCart(item)
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
      <div className="relative h-40 sm:h-48 md:h-56">
        <Image src={item.image || "/placeholder.svg"} alt={getName()} fill className="object-cover" />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
          <span className="text-white font-semibold text-xs sm:text-sm">{item.rating}</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-1">{getName()}</h3>
        <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 line-clamp-2">{getDescription()}</p>

        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            <Weight className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-white text-xs sm:text-sm font-medium">{item.weight}g</span>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-white text-xs sm:text-sm font-medium">{item.prepTime} min</span>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <p className="text-xs text-white/60 mb-1.5 sm:mb-2">
            {language === "uz" ? "Tarkibi:" : language === "ru" ? "Состав:" : "Ingredients:"}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {Array.isArray(getIngredients()) && getIngredients()
              .slice(0, 4)
              .map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-white/10 text-white/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap"
                >
                  {ingredient}
                </span>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-white/20">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-400 whitespace-nowrap">
            {item.price.toLocaleString()} so'm
          </div>

          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={!item.available}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full h-8 sm:h-10 px-4 sm:px-6 text-sm sm:text-base shadow-lg shadow-amber-500/30 whitespace-nowrap"
            >
              {language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}
            </Button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full p-0.5 sm:p-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDecrement}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-white/20 text-white"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="text-white font-semibold w-6 sm:w-8 text-center text-sm sm:text-base">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleIncrement}
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-white/20 text-white"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
