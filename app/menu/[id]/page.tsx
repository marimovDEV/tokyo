"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, Star, ChefHat } from "lucide-react"
import { useMenuItem } from "@/hooks/use-api"
import { type CartItem, type Cart, apiClient, formatPrice, getImageUrl } from "@/lib/api"
import { useLanguage } from "@/contexts/LanguageContext"
import Image from "next/image"

export default function MenuItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const { menuItem: item, loading, error } = useMenuItem(parseInt(params.id as string))

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const cartData = await apiClient.getCart()
      setCart(cartData)
    } catch (error) {
      console.error("Error loading cart:", error)
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }

  const translations = {
    uz: {
      back: "Ortga",
      addToCart: "Savatga Qo'shish",
      quantity: "Miqdor",
      ingredients: "Tarkibi",
      prepTime: "Tayyorlash vaqti",
      rating: "Reyting",
      minutes: "daqiqa",
    },
    ru: {
      back: "Назад",
      addToCart: "Добавить в Корзину",
      quantity: "Количество",
      ingredients: "Ингредиенты",
      prepTime: "Время приготовления",
      rating: "Рейтинг",
      minutes: "минут",
    },
    en: {
      back: "Back",
      addToCart: "Add to Cart",
      quantity: "Quantity",
      ingredients: "Ingredients",
      prepTime: "Prep time",
      rating: "Rating",
      minutes: "min",
    },
  }

  const t = translations[language]

  const addToCart = async () => {
    if (!item) return

    setIsAddingToCart(true)
    try {
      await apiClient.addToCart({
        menu_item_id: item.id,
        quantity: quantity,
      })
      await loadCart()
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const updateCartQuantity = async (newQuantity: number) => {
    if (!item || !cart) return

    const cartItem = cart.items.find(cartItem => cartItem.menu_item === item.id)
    if (!cartItem) return

    if (newQuantity <= 0) {
      // Remove from cart when quantity reaches 0
      await removeFromCart()
    } else {
      try {
        await apiClient.updateCartItem(cartItem.id, { quantity: newQuantity })
        await loadCart()
      } catch (error) {
        console.error("Error updating cart item:", error)
      }
    }
  }

  const removeFromCart = async () => {
    if (!item || !cart) return

    const cartItem = cart.items.find(cartItem => cartItem.menu_item === item.id)
    if (!cartItem) return

    try {
      await apiClient.removeFromCart(cartItem.id)
      await loadCart()
    } catch (error) {
      console.error("Error removing from cart:", error)
    }
  }

  const getCartItemCount = () => {
    return cart?.total_items || 0
  }

  const getCartTotal = () => {
    return cart?.total_price || 0
  }

  const isItemInCart = () => {
    if (!item || !cart) return false
    return cart.items.some(cartItem => cartItem.menu_item === item.id)
  }

  const getItemQuantityInCart = () => {
    if (!item || !cart) return 0
    const cartItem = cart.items.find(cartItem => cartItem.menu_item === item.id)
    return cartItem?.quantity || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <p className="text-xl text-green-800">Loading...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <p className="text-xl text-red-800">Error loading item: {error || "Item not found"}</p>
      </div>
    )
  }

  const itemName = language === "uz" ? item?.name_uz : language === "ru" ? item?.name_ru : item?.name
  const itemDescription =
    language === "uz" ? item?.description_uz : language === "ru" ? item?.description_ru : item?.description
  const itemIngredients =
    language === "uz" ? item?.ingredients_uz : language === "ru" ? item?.ingredients_ru : item?.ingredients

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-green-800 text-white shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/menu")}
              className="hover:bg-white/20 text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t.back}
            </Button>

            <div className="flex gap-2">
              <Button
                variant={language === "uz" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("uz")}
                className={language === "uz" ? "" : "text-white hover:bg-white/20"}
              >
                O'Z
              </Button>
              <Button
                variant={language === "ru" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("ru")}
                className={language === "ru" ? "" : "text-white hover:bg-white/20"}
              >
                RU
              </Button>
              <Button
                variant={language === "en" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
                className={language === "en" ? "" : "text-white hover:bg-white/20"}
              >
                EN
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="overflow-hidden shadow-2xl border-2 border-green-200">
          {/* Image */}
          <div className="relative h-80 bg-gray-100">
            <Image 
              src={getImageUrl(item.image)} 
              alt={itemName} 
              fill 
              className="object-cover" 
            />
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-green-900 mb-2">{itemName}</h1>
              <p className="text-green-700 text-lg mb-4">{itemDescription}</p>

              <div className="flex items-center gap-6 text-sm text-green-700">
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{item.rating}</span>
                  </div>
                )}
                {item.prep_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span>
                      {t.prepTime}: {item.prep_time} {t.minutes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {itemIngredients && itemIngredients.length > 0 && (
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <ChefHat className="w-6 h-6" />
                  {t.ingredients}
                </h2>
                <ul className="space-y-2">
                  {itemIngredients.map((ingredient, index) => (
                    <li key={index} className="text-green-800 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-green-200">
              <div>
                <p className="text-3xl font-bold text-green-700">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center gap-4">
                {!isLoading && cart && isItemInCart() ? (
                  // Show quantity controls if item is in cart (quantity >= 1)
                  <div className="flex items-center gap-3 bg-green-100 rounded-full px-4 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCartQuantity(getItemQuantityInCart() - 1)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-green-200"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold text-green-900 min-w-[30px] text-center">
                      {getItemQuantityInCart()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateCartQuantity(getItemQuantityInCart() + 1)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-green-200"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  // Show only add to cart button if item is not in cart
                  <Button
                    onClick={addToCart}
                    disabled={isAddingToCart || isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-6 rounded-full shadow-xl disabled:opacity-50"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isAddingToCart ? "Qo'shilmoqda..." : t.addToCart}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Cart Icon */}
      {cart && cart.total_items >= 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <div className="bg-white text-green-700 px-6 py-2 rounded-full shadow-xl text-base font-bold border-2 border-green-600">
            {formatPrice(getCartTotal())}
          </div>
          <Button
            onClick={() => router.push("/cart")}
            className="relative bg-gradient-to-r from-green-700 to-green-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full h-16 w-16 p-0 hover:scale-110 active:scale-95"
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 text-xs bg-green-500 text-white animate-pulse flex items-center justify-center border-2 border-white">
              {getCartItemCount()}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  )
}
