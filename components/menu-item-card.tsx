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
    if (language === "uz") return item.name_uz
    if (language === "ru") return item.name_ru
    return item.name
  }

  const getDescription = () => {
    if (language === "uz") return item.description_uz
    if (language === "ru") return item.description_ru
    return item.description
  }

  const getIngredients = () => {
    if (language === "uz") return item.ingredients_uz || []
    if (language === "ru") return item.ingredients_ru || []
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
    <div 
      data-menu-item-id={item.id}
      className="group bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-[20px] overflow-hidden border border-white/20 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/30 h-full flex flex-col"
    >
      {/* Image Section - 1:1 Aspect Ratio */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image 
          src={item.image || "/placeholder.svg"} 
          alt={getName()} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
          <span className="text-white font-semibold text-sm">{item.rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {getName()}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
          {getDescription()}
        </p>

        {/* Info Pills - Weight and Time */}
        <div className="flex gap-2 mb-4">
          {item.weight && item.weight > 0 && (
            <div className="flex items-center gap-1.5 bg-gray-600/30 px-3 py-1.5 rounded-full">
              <Weight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">
                {typeof item.weight === 'number' ? `${item.weight}g` : `${item.weight}`}
              </span>
            </div>
          )}
          {item.prep_time && item.prep_time.trim() && (
            <div className="flex items-center gap-1.5 bg-gray-600/30 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">{item.prep_time} min</span>
            </div>
          )}
        </div>

        {/* Ingredients Section */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            {language === "uz" ? "Tarkibi:" : language === "ru" ? "Состав:" : "Ingredients:"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(getIngredients()) && getIngredients()
              .slice(0, 3)
              .map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full whitespace-nowrap"
                >
                  {ingredient}
                </span>
              ))}
            {Array.isArray(getIngredients()) && getIngredients().length > 3 && (
              <span className="text-xs text-gray-400 px-2.5 py-1">
                +{getIngredients().length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Price and Add Button - Bottom aligned */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 mt-auto">
          <div className="text-xl font-bold text-orange-400">
            {item.price.toLocaleString()} so'm
          </div>

          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={!item.available}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full h-11 px-6 text-base font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-200 min-w-[100px]"
            >
              {language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add"}
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
  )
}
