"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ChevronDown } from "lucide-react"
import { formatPrice, apiClient, getImageUrl, type Cart, type CartItem, type Order } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/components/ui/toast"
import Image from "next/image"

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const { language, setLanguage } = useLanguage()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)

  useEffect(() => {
    // Only load cart once on component mount
    loadCart()
  }, []) // Empty dependency array - only run once

  const loadCart = async () => {
    try {
      setIsLoading(true)
      const cartData = await apiClient.getCart()
      setCart(cartData)
    } catch (error) {
      console.error("Error loading cart:", error)
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCartQuantity = async (itemId: number, newQuantity: number) => {
    // Find the cart item
    const cartItem = cart?.items.find((ci) => ci.id === itemId)
    if (!cartItem) {
      console.error("Cart item not found:", itemId)
      return
    }

    try {
      if (newQuantity <= 0) {
        await removeFromCart(itemId)
      } else {
        const updatedCart = await apiClient.updateCartItem(itemId, { quantity: newQuantity })
        setCart(updatedCart)
      }
    } catch (error) {
      console.error("Error updating cart item:", error)
      addToast({
        type: "error",
        description: language === "uz"
          ? "Savatchani yangilashda xatolik"
          : language === "ru"
            ? "Ошибка при обновлении корзины"
            : "Error updating cart",
      })
    }
  }

  const removeFromCart = async (itemId: number) => {
    try {
      const updatedCart = await apiClient.removeFromCart(itemId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error removing cart item:", error)
    }
  }

  const handleSubmitOrder = async () => {
    if (!cart || cart.items.length === 0) return

    setIsSubmitting(true)

    try {
      const order = await apiClient.createOrderFromCart({
        table_number: 1, // Default table number, you can make this configurable
        customer_name: cart.customer_name || "",
        notes: cart.notes || "",
      })

      // Reload cart to get the cleared state
      await loadCart()

      // Show success notification
      addToast({
        type: "success",
        title: language === "uz"
          ? "Buyurtma qabul qilindi"
          : language === "ru"
            ? "Заказ принят"
            : "Order submitted",
        description: language === "uz"
          ? `Buyurtmangiz qabul qilindi! Buyurtma raqami: ${order.id}`
          : language === "ru"
            ? `Заказ принят! Номер заказа: ${order.id}`
            : `Order submitted successfully! Order ID: ${order.id}`,
      })

      window.location.href = "/menu"
    } catch (error) {
      console.error("Error submitting order:", error)
      addToast({
        type: "error",
        title: language === "uz" ? "Xatolik yuz berdi" : language === "ru" ? "Произошла ошибка" : "Error occurred",
        description: language === "uz" ? "Buyurtmani yuborishda xatolik!" : language === "ru" ? "Ошибка при отправке заказа!" : "Error submitting order!",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const translations = {
    uz: {
      cart: "Savatcha",
      emptyCart: "Savatchangiz bo'sh",
      chooseItems: "Menyudan taom tanlang",
      backToMenu: "Menyuga qaytish",
      items: "ta",
      selectedItems: "Tanlangan taomlar",
      modifyItems: "Miqdorni o'zgartiring yoki olib tashlang",
      notes: "Izoh:",
      orderSummary: "Buyurtma xulosasi",
      itemsCount: "Mahsulotlar soni:",
      subtotal: "Subtotal:",
      total: "Jami:",
      placeOrder: "Buyurtma berish",
      submitting: "Yuborilmoqda...",
      // orderNote: "Buyurtmangiz ofitsiantga yuboriladi va tez orada tayyorlanadi", // Removed
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
    },
    ru: {
      cart: "Корзина",
      emptyCart: "Ваша корзина пуста",
      chooseItems: "Выберите блюда из меню",
      backToMenu: "Вернуться в меню",
      items: "шт",
      selectedItems: "Выбранные блюда",
      modifyItems: "Измените количество или удалите",
      notes: "Примечание:",
      orderSummary: "Итоги заказа",
      itemsCount: "Количество товаров:",
      subtotal: "Промежуточный итог:",
      total: "Итого:",
      placeOrder: "Оформить заказ",
      submitting: "Отправка...",
      // orderNote: "Ваш заказ будет отправлен официанту и скоро будет готов", // Removed
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
    },
    en: {
      cart: "Cart",
      emptyCart: "Your cart is empty",
      chooseItems: "Choose items from the menu",
      backToMenu: "Back to Menu",
      items: "items",
      selectedItems: "Selected Items",
      modifyItems: "Modify quantities or remove items",
      notes: "Notes:",
      orderSummary: "Order Summary",
      itemsCount: "Items:",
      subtotal: "Subtotal:",
      total: "Total:",
      placeOrder: "Place Order",
      submitting: "Submitting...",
      // orderNote: "Your order will be sent to the waiter and prepared shortly", // Removed
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
    },
  }

  const t = translations[language]

  const getLanguageCode = () => {
    return language === "uz" ? "UZ" : language === "ru" ? "RU" : "EN"
  }

  const getCartItemImage = (item: CartItem) => {
    // If item has an image from API, use it
    if (item.menu_item_image && item.menu_item_image !== null) {
      return getImageUrl(item.menu_item_image)
    }
    
    // Map menu item names to local images
    const imageMap: { [key: string]: string } = {
      'Bruschetta': '/bruschetta.jpg',
      'Tiramisu': '/tiramisu.jpg',
      'Beef Steak': '/beef-steak.jpg',
      'Greek Salad': '/greek-salad.jpg',
      'Chicken Alfredo': '/chicken-alfredo.jpg',
      'French Onion Soup': '/french-onion-soup.jpg',
      'Minestrone Soup': '/minestrone-soup.jpg',
      'Tom Yum Soup': '/tom-yum-soup.jpg',
      'Pepperoni Pizza': '/pepperoni-pizza.jpg',
      'Vegetarian Pizza': '/vegetarian-pizza.jpg',
      'Quattro Formaggi Pizza': '/quattro-formaggi-pizza.jpg',
      'Margherita Pizza': '/pepperoni-pizza.jpg', // Using pepperoni as fallback
      'Fresh Lemonade': '/fresh-lemonade.jpg',
      'Iced Coffee': '/iced-coffee.jpg',
      'Mango Smoothie': '/mango-smoothie.jpg',
      'Orange Juice': '/fresh-lemonade.jpg', // Using lemonade as fallback
      'Cheesecake': '/cheesecake.jpg',
      'Panna Cotta': '/panna-cotta.jpg',
      'Chocolate Cake': '/cheesecake.jpg', // Using cheesecake as fallback
      'Salmon Fillet': '/salmon-fillet.jpg',
      'Spring Rolls': '/spring-rolls.jpg',
      // Add more variations and common names
      'Caesar Salad': '/greek-salad.jpg',
      'Grilled Chicken': '/chicken-alfredo.jpg',
      'Creamy Mushroom Soup': '/minestrone-soup.jpg',
      'Decadent Chocolate Cake': '/cheesecake.jpg',
      'Glass of Orange Juice': '/fresh-lemonade.jpg',
    }
    
    // Try exact match first
    let fallbackImage = imageMap[item.menu_item_name]
    
    // If no exact match, try partial matching
    if (!fallbackImage) {
      const itemName = item.menu_item_name.toLowerCase()
      for (const [key, value] of Object.entries(imageMap)) {
        if (itemName.includes(key.toLowerCase()) || key.toLowerCase().includes(itemName)) {
          fallbackImage = value
          break
        }
      }
    }
    
    // Final fallback
    if (!fallbackImage) {
      fallbackImage = '/placeholder.svg'
    }
    
    return fallbackImage
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <header className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (window.location.href = "/menu")}
                  className="hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full shadow-md">
                    <img
                      src="/logo.png"
                      alt="Tokyo Logo"
                      width="32"
                      height="32"
                      className="w-8 h-8 object-contain rounded-full"
                      loading="eager"
                    />
                  </div>
                  <h1 className="text-xl font-bold">{t.cart}</h1>
                </div>
              </div>
              <DropdownMenu open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/20 font-semibold flex items-center gap-1.5 text-white"
                  >
                    {getLanguageCode()}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("uz")
                      localStorage.setItem("restaurant-language", "uz")
                      setLanguageDropdownOpen(false)
                    }}
                    className={language === "uz" ? "bg-accent" : ""}
                  >
                    {t.languageUz}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("ru")
                      localStorage.setItem("restaurant-language", "ru")
                      setLanguageDropdownOpen(false)
                    }}
                    className={language === "ru" ? "bg-accent" : ""}
                  >
                    {t.languageRu}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("en")
                      localStorage.setItem("restaurant-language", "en")
                      setLanguageDropdownOpen(false)
                    }}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    {t.languageEn}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{t.emptyCart}</h2>
            <p className="text-gray-600 mb-8">{t.chooseItems}</p>
            <Button
              onClick={() => (window.location.href = "/menu")}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {t.backToMenu}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (window.location.href = "/menu")}
                  className="hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full shadow-md">
                    <img
                      src="/logo.png"
                      alt="Tokyo Logo"
                      width="32"
                      height="32"
                      className="w-8 h-8 object-contain rounded-full"
                      loading="eager"
                    />
                  </div>
                  <h1 className="text-xl font-bold">{t.cart}</h1>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  {cart.total_items} {t.items}
                </div>
              </div>
            <DropdownMenu open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/20 font-semibold flex items-center gap-1.5 text-white"
                >
                  {getLanguageCode()}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    setLanguage("uz")
                    localStorage.setItem("restaurant-language", "uz")
                    setLanguageDropdownOpen(false)
                  }}
                  className={language === "uz" ? "bg-accent" : ""}
                >
                  {t.languageUz}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setLanguage("ru")
                    localStorage.setItem("restaurant-language", "ru")
                    setLanguageDropdownOpen(false)
                  }}
                  className={language === "ru" ? "bg-accent" : ""}
                >
                  {t.languageRu}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setLanguage("en")
                    localStorage.setItem("restaurant-language", "en")
                    setLanguageDropdownOpen(false)
                  }}
                  className={language === "en" ? "bg-accent" : ""}
                >
                  {t.languageEn}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4">
              <h2 className="text-lg font-bold">{t.selectedItems}</h2>
              <p className="text-sm text-green-50 mt-1">{t.modifyItems}</p>
            </div>
            <div className="divide-y">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={getCartItemImage(item)}
                        alt={language === "uz" ? item.menu_item_name_uz : language === "ru" ? item.menu_item_name_ru : item.menu_item_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg'
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
                        {language === "uz" ? item.menu_item_name_uz : language === "ru" ? item.menu_item_name_ru : item.menu_item_name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">{formatPrice(item.price)}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                          {t.notes} {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="font-semibold text-base min-w-[32px] text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="font-bold text-green-700 text-base">
                        {formatPrice(item.total_price)}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4">
              <h2 className="text-lg font-bold">{t.orderSummary}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">{t.itemsCount}</span>
                  <span className="font-semibold">{cart.total_items}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-medium">{t.subtotal}</span>
                  <span className="font-semibold">{formatPrice(cart.total_price)}</span>
                </div>

                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{t.total}</span>
                    <span className="text-2xl font-bold text-green-700">{formatPrice(cart.total_price)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.submitting}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {t.placeOrder}
                  </span>
                )}
              </Button>

              {/* Order note removed */}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
