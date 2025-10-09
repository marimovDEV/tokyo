"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  ArrowLeft,
  Star,
  Clock,
  ChevronDown,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { useCategories, useMenuItems, usePromotions, useTextContent } from "@/hooks/use-api"
import { formatPrice, apiClient, getImageUrl, type CartItem, type MenuItem } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/LanguageContext"
import { useToast } from "@/components/ui/toast"

// Remove local promotions data - will use API

export default function MenuPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"categories" | "products">("categories")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [cart, setCart] = useState<{ total_items: number; total_price: number; items: any[] }>({ total_items: 0, total_price: 0, items: [] })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [itemNotes, setItemNotes] = useState("")
  const { language, setLanguage } = useLanguage()
  const { addToast } = useToast()
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  // Reset isAddingToCart state on component mount
  useEffect(() => {
    setIsAddingToCart(false)
  }, [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDish, setModalDish] = useState<MenuItem | null>(null)

  // Use API hooks
  const { categories = [], loading: categoriesLoading, error: categoriesError } = useCategories()
  const { menuItems: allMenuItems = [], loading: allMenuItemsLoading, error: allMenuItemsError } = useMenuItems()
  const { promotions = [], loading: promotionsLoading, error: promotionsError } = usePromotions()
  const { textContent, loading: textContentLoading, error: textContentError } = useTextContent('menu')
  
  // Get dynamic content from API
  const getContent = (key: string, fallback: string = '', field: string = 'title') => {
    if (textContentLoading || !textContent) return fallback;
    
    const content = textContent.find(item => item.key === key);
    if (!content) return fallback;
    
    const fieldName = `${field}${language === 'uz' ? '_uz' : language === 'ru' ? '_ru' : ''}`;
    return content[fieldName] || content[field] || fallback;
  };

  // Use all menu items - filtering will be done in filteredItems
  const menuItems = allMenuItems

  // Clear search when language changes
  useEffect(() => {
    setSearchQuery("")
  }, [language])

  // Force re-render when language changes
  useEffect(() => {
    // This will trigger a re-render of filtered items
    // console.log('Language changed to:', language) // Commented out to reduce console logs
  }, [language, menuItems])

  // Debug search function
  const debugSearch = (item: any, searchTerm: string) => {
    if (searchTerm.length > 0) {
      console.log('Searching for:', searchTerm)
      console.log('Item:', item.name, item.name_uz, item.name_ru)
      console.log('Matches:', {
        name: item.name?.toLowerCase().includes(searchTerm),
        name_uz: item.name_uz?.toLowerCase().includes(searchTerm),
        name_ru: item.name_ru?.toLowerCase().includes(searchTerm)
      })
    }
  }

  // Get localized name based on current language
  const getLocalizedName = (item: any) => {
    switch (language) {
      case 'uz':
        return item.name_uz || item.name
      case 'ru':
        return item.name_ru || item.name
      default:
        return item.name
    }
  }

  // Get localized description based on current language
  const getLocalizedDescription = (item: any) => {
    switch (language) {
      case 'uz':
        return item.description_uz || item.description
      case 'ru':
        return item.description_ru || item.description
      default:
        return item.description
    }
  }

  // Get localized category name based on current language
  const getLocalizedCategoryName = (category: any) => {
    if (!category) return ''
    switch (language) {
      case 'uz':
        return category.name_uz || category.name
      case 'ru':
        return category.name_ru || category.name
      default:
        return category.name
    }
  }

  // Highlight search term in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px;">$1</mark>')
  }

  // Get search result display name (shows in current language but indicates if found in different language)
  const getSearchResultName = (item: any) => {
    const localizedName = getLocalizedName(item)
    const searchTerm = searchQuery.toLowerCase().trim()
    
    if (!searchTerm) return localizedName
    
    // Check if the search term was found in a different language
    const foundInUz = item.name_uz?.toLowerCase().includes(searchTerm)
    const foundInRu = item.name_ru?.toLowerCase().includes(searchTerm)
    const foundInEn = item.name?.toLowerCase().includes(searchTerm)
    
    // If found in current language, just return the localized name
    if ((language === 'uz' && foundInUz) || 
        (language === 'ru' && foundInRu) || 
        (language === 'en' && foundInEn)) {
      return localizedName
    }
    
    // If found in different language, show localized name with indicator
    if (foundInUz && language !== 'uz') {
      return `${localizedName} (O'zbek tilida topildi)`
    } else if (foundInRu && language !== 'ru') {
      return `${localizedName} (Найдено на русском)`
    } else if (foundInEn && language !== 'en') {
      return `${localizedName} (Found in English)`
    }
    
    return localizedName
  }

  // Enhanced search with better language detection
  const enhancedSearch = (item: any, searchTerm: string) => {
    const safeIncludes = (str: string | null | undefined, term: string): boolean => {
      if (!str) return false
      return str.toLowerCase().includes(term)
    }
    
    // Check all languages for matches
    const matches = {
      name: safeIncludes(item.name, searchTerm),
      name_uz: safeIncludes(item.name_uz, searchTerm),
      name_ru: safeIncludes(item.name_ru, searchTerm),
      description: safeIncludes(item.description, searchTerm),
      description_uz: safeIncludes(item.description_uz, searchTerm),
      description_ru: safeIncludes(item.description_ru, searchTerm)
    }
    
    // Store match information for display
    if (matches.name_uz || matches.description_uz) {
      item._matchedLanguage = 'uz'
    } else if (matches.name_ru || matches.description_ru) {
      item._matchedLanguage = 'ru'
    } else if (matches.name || matches.description) {
      item._matchedLanguage = 'en'
    }
    
    return Object.values(matches).some(Boolean)
  }

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    // Language is already managed by LanguageContext, no need to set it here
    // Load cart with delay to ensure backend is ready
    const timer = setTimeout(() => {
      loadCart()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Handle openDish query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const openDishId = urlParams.get('openDish')
    
    if (openDishId && menuItems.length > 0) {
      const dish = menuItems.find(item => item.id === parseInt(openDishId))
      if (dish) {
        setModalDish(dish)
        setIsModalOpen(true)
        // Clean up the URL parameter
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [menuItems])

  useEffect(() => {
    localStorage.setItem("restaurant-language", language)
  }, [language])



  const loadCart = async () => {
    try {
      console.log("Loading cart...")
      const cartData = await apiClient.getCart()
      console.log("Cart loaded:", cartData)
      setCart({
        total_items: cartData.total_items || 0,
        total_price: cartData.total_price || 0,
        items: cartData.items || []
      })
    } catch (error) {
      console.error("Error loading cart:", error)
      // Set empty cart on error
      setCart({
        total_items: 0,
        total_price: 0,
        items: []
      })
    }
  }


  useEffect(() => {
    if (!isAutoPlaying || promotions.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, promotions.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      nextSlide()
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right
      prevSlide()
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const filteredItems = menuItems.filter((item) => {
    // Only show items if a category is selected
    const matchesCategory = selectedCategory && item.category === parseInt(selectedCategory)
    
    if (!searchQuery || searchQuery.trim() === "") {
      return matchesCategory && item.available
    }
    
    const searchTerm = searchQuery.toLowerCase().trim()
    
    // Safe string check function
    const safeIncludes = (str: string | null | undefined, term: string): boolean => {
      if (!str) return false
      return str.toLowerCase().includes(term)
    }
    
    // Use enhanced search function
    const matchesSearch = enhancedSearch(item, searchTerm) ||
      // Also check ingredients and categories
      (item.ingredients && Array.isArray(item.ingredients) && 
        item.ingredients.some((ingredient: string) => 
          safeIncludes(ingredient, searchTerm)
        )) ||
      (item.ingredients_uz && Array.isArray(item.ingredients_uz) && 
        item.ingredients_uz.some((ingredient: string) => 
          safeIncludes(ingredient, searchTerm)
        )) ||
      (item.ingredients_ru && Array.isArray(item.ingredients_ru) && 
        item.ingredients_ru.some((ingredient: string) => 
          safeIncludes(ingredient, searchTerm)
        )) ||
      // Category names in all languages
      (item.category_name && safeIncludes(item.category_name, searchTerm)) ||
      (item.category_name_uz && safeIncludes(item.category_name_uz, searchTerm)) ||
      (item.category_name_ru && safeIncludes(item.category_name_ru, searchTerm))
    
    // Debug search for first few items
    if (menuItems.indexOf(item) < 2 && searchTerm.length > 0) {
      debugSearch(item, searchTerm)
    }
    
    // Store search result info for display
    if (matchesSearch) {
      item._searchResultName = getSearchResultName(item)
    }
    
    return matchesCategory && matchesSearch && item.available
  })

  const addToCart = async (item: MenuItem, quantity = 1, notes?: string) => {
    if (isAddingToCart) {
      return
    }
    
    setIsAddingToCart(true)
    try {
      const result = await apiClient.addToCart({
        menu_item_id: item.id,
        quantity,
        notes
      })
      await loadCart() // Reload cart data
      
      addToast({
        type: "success",
        description: language === "uz"
          ? "Mahsulot savatchaga qo'shildi!"
          : language === "ru"
            ? "Товар добавлен в корзину!"
            : "Item added to cart!",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      addToast({
        type: "error",
        description: language === "uz"
          ? "Savatchaga qo'shishda xatolik yuz berdi"
          : language === "ru"
            ? "Ошибка при добавлении в корзину"
            : "Error adding to cart",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const removeFromCart = async (itemId: number) => {
    const cartItem = cart.items.find((ci) => ci.menu_item === itemId)
    if (cartItem) {
      const newQuantity = cartItem.quantity - 1
      if (newQuantity <= 0) {
        // Remove the item completely
        try {
          await apiClient.removeFromCart(cartItem.id)
          await loadCart()
          addToast({
            type: "success",
            description: language === "uz"
              ? "Mahsulot savatchadan olib tashlandi"
              : language === "ru"
                ? "Товар удален из корзины"
                : "Item removed from cart",
          })
        } catch (error) {
          console.error("Error removing from cart:", error)
          addToast({
            type: "error",
            description: language === "uz"
              ? "Savatchadan olib tashlashda xatolik"
              : language === "ru"
                ? "Ошибка при удалении из корзины"
                : "Error removing from cart",
          })
        }
      } else {
        // Update quantity
        try {
          await apiClient.updateCartItem(cartItem.id, { quantity: newQuantity })
          await loadCart()
        } catch (error) {
          console.error("Error updating cart item:", error)
        }
      }
    }
  }

  const updateCartQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Find the cart item and remove it
      const cartItem = cart.items.find((ci) => ci.menu_item === itemId)
      if (cartItem) {
        try {
          await apiClient.removeFromCart(cartItem.id)
          await loadCart()
        } catch (error) {
          console.error("Error removing from cart:", error)
        }
      }
    } else {
      // Find the cart item and update its quantity
      const cartItem = cart.items.find((ci) => ci.menu_item === itemId)
      if (cartItem) {
        try {
          await apiClient.updateCartItem(cartItem.id, { quantity: newQuantity })
          await loadCart()
        } catch (error) {
          console.error("Error updating cart item:", error)
        }
      }
    }
  }

  const getCartTotal = () => {
    return cart.total_price
  }

  const getCartItemCount = () => {
    return cart.total_items
  }

  const handleItemClick = (item: MenuItem) => {
    setModalDish(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalDish(null)
  }

  const handlePromotionClick = (promotion: any) => {
    console.log('Promotion clicked:', promotion)
    
    // First, filter by the promotion's category
    if (promotion.category) {
      setSelectedCategory(promotion.category.toString())
      setViewMode("products")
      setSearchQuery("")
      
      // If there's a linked dish, highlight it after a short delay
      if (promotion.linked_dish && promotion.linked_dish.id) {
        setTimeout(() => {
          const linkedDish = allMenuItems.find((item: any) => item.id === promotion.linked_dish.id)
          if (linkedDish) {
            // Scroll to the linked dish and highlight it
            const dishElement = document.getElementById(`dish-${linkedDish.id}`)
            if (dishElement) {
              dishElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              // Add highlight effect
              dishElement.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75')
              setTimeout(() => {
                dishElement.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75')
              }, 3000)
            }
          }
        }, 500) // Wait for category filter to apply
      }
    } else if (promotion.linked_dish && promotion.linked_dish.id) {
      // If no category but has linked dish, find the dish's category
      const linkedDish = allMenuItems.find((item: any) => item.id === promotion.linked_dish.id)
      if (linkedDish) {
        setSelectedCategory(linkedDish.category.toString())
        setViewMode("products")
        setSearchQuery("")
        
        setTimeout(() => {
          const dishElement = document.getElementById(`dish-${linkedDish.id}`)
          if (dishElement) {
            dishElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            dishElement.classList.add('ring-4', 'ring-yellow-400', 'ring-opacity-75')
            setTimeout(() => {
              dishElement.classList.remove('ring-4', 'ring-yellow-400', 'ring-opacity-75')
            }, 3000)
          }
        }, 500)
      }
    } else {
      // No category or linked dish, show all items
      setSelectedCategory("")
      setViewMode("products")
      setSearchQuery("")
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setViewMode("products")
    setSearchQuery("")
  }

  const handleBackToCategories = () => {
    setViewMode("categories")
    setSelectedCategory("")
    setSearchQuery("")
  }

  const translations = {
    uz: {
      title: getContent('menu_title', "Restoran Menyusi"),
      subtitle: getContent('menu_subtitle', "Eng mazali taomlar"),
      cart: getContent('cart', "Savatcha"),
      search: "🔍 Taom qidirish...",
      categories: getContent('categories', "Kategoriyalar"),
      selectCategory: getContent('select_category', "Kategoriyani tanlang"),
      all: getContent('all', "Barchasi"),
      notFound: getContent('not_found', "Hech narsa topilmadi"),
      tryAgain: "Boshqa kalit so'z bilan qidiring",
      items: getContent('items_count', "ta mahsulot"),
      total: "Jami:",
      viewCart: "Ko'rish",
      add: "Qo'shish",
      addToCart: "Savatchaga qo'shish",
      specialNotes: "Qo'shimcha izoh (ixtiyoriy)",
      notesPlaceholder: "Masalan: achchiq bo'lmasin, tuzni kam qo'ying...",
      backToCategories: "Kategoriyalarga qaytish",
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
      learnMore: "Batafsil",
    },
    ru: {
      title: getContent('menu_title', "Меню Ресторана"),
      subtitle: getContent('menu_subtitle', "Самые вкусные блюда"),
      cart: getContent('cart', "Корзина"),
      search: "🔍 Поиск блюд...",
      categories: getContent('categories', "Категории"),
      selectCategory: getContent('select_category', "Выберите категорию"),
      all: getContent('all', "Все"),
      notFound: getContent('not_found', "Ничего не найдено"),
      tryAgain: "Попробуйте другие ключевые слова",
      items: getContent('items_count', "товаров"),
      total: "Итого:",
      viewCart: "Посмотреть",
      add: "Добавить",
      addToCart: "Добавить в корзину",
      specialNotes: "Особые пожелания (необязательно)",
      notesPlaceholder: "Например: не острое, меньше соли...",
      backToCategories: "Вернуться к категориям",
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
      learnMore: "Подробнее",
    },
    en: {
      title: getContent('menu_title', "Restaurant Menu"),
      subtitle: getContent('menu_subtitle', "Delicious dishes await"),
      cart: getContent('cart', "Cart"),
      search: "🔍 Search dishes...",
      categories: getContent('categories', "Categories"),
      selectCategory: getContent('select_category', "Select a category"),
      all: getContent('all', "All"),
      notFound: getContent('not_found', "No items found"),
      tryAgain: "Try searching with different keywords",
      items: getContent('items_count', "items"),
      total: "Total:",
      viewCart: "View Cart",
      add: "Add",
      addToCart: "Add to Cart",
      specialNotes: "Special notes (optional)",
      notesPlaceholder: "e.g., no spicy, less salt...",
      backToCategories: "Back to Categories",
      languageUz: "O'zbekcha",
      languageRu: "Русский",
      languageEn: "English",
      learnMore: "Learn More",
    },
  }

  const t = translations[language]

  const getCategoryName = (category: any) => {
    if (language === "uz") return category.name_uz
    if (language === "ru") return category.name_ru
    return category.name
  }

  const getCategoryImage = (category: any) => {
    // If category has an image from API, use it
    if (category.image && category.image !== null) {
      return getImageUrl(category.image)
    }
    
    // Map category names to local images
    const imageMap: { [key: string]: string } = {
      'Appetizers': '/category-appetizers.jpg',
      'Beverages': '/category-beverages.jpg',
      'Desserts': '/category-desserts.jpg',
      'Main Dishes': '/category-main.jpg',
      'Pizza': '/category-pizza.jpg',
      'Soups': '/category-soups.jpg',
      'Special Offers': '/category-promotions.jpg',
    }
    
    return imageMap[category.name] || '/placeholder.svg'
  }

  const getMenuItemImage = (item: any) => {
    // If item has an image from API, use it
    if (item.image && item.image !== null) {
      return getImageUrl(item.image)
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
    }
    
    return imageMap[item.name] || '/placeholder.svg'
  }

  const getLanguageCode = () => {
    return language === "uz" ? "UZ" : language === "ru" ? "RU" : "EN"
  }

  const getPromotionText = (promotion: (typeof promotions)[0], field: "title" | "description") => {
    if (field === "title") {
      return language === "uz" ? promotion.title_uz : language === "ru" ? promotion.title_ru : promotion.title
    }
    return language === "uz"
      ? promotion.description_uz
      : language === "ru"
        ? promotion.description_ru
        : promotion.description
  }

  const getPromotionImage = (promotion: (typeof promotions)[0]) => {
    // If promotion has an image from API, use it
    if (promotion.image && promotion.image !== null) {
      return getImageUrl(promotion.image)
    }
    
    // Map promotion titles to local images
    const imageMap: { [key: string]: string } = {
      'Summer Special': '/restaurant-discount-promotion.jpg',
      'Family Combo': '/restaurant-family-combo-meal.jpg',
    }
    
    return imageMap[promotion.title] || '/restaurant-special-offer-banner.jpg'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (viewMode === "categories" ? router.push("/") : handleBackToCategories())}
                className="hover:bg-white/20 text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-full shadow-md">
                  <img
                    src="/logo.png"
                    alt="Tokyo Logo"
                    className="w-12 h-12 object-cover rounded-full"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{t.title}</h1>
                  <p className="text-xs opacity-90">{viewMode === "categories" ? t.selectCategory : t.subtitle}</p>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-2">
                <DropdownMenu open={languageDropdownOpen} onOpenChange={setLanguageDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/20 font-semibold flex items-center gap-1 text-white"
                  >
                    {getLanguageCode()}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("uz")
                      setLanguageDropdownOpen(false)
                      setSearchQuery("") // Clear search when language changes
                    }}
                    className={language === "uz" ? "bg-accent" : ""}
                  >
                    {t.languageUz}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("ru")
                      setLanguageDropdownOpen(false)
                      setSearchQuery("") // Clear search when language changes
                    }}
                    className={language === "ru" ? "bg-accent" : ""}
                  >
                    {t.languageRu}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setLanguage("en")
                      setLanguageDropdownOpen(false)
                      setSearchQuery("") // Clear search when language changes
                    }}
                    className={language === "en" ? "bg-accent" : ""}
                  >
                    {t.languageEn}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="default"
                size="sm"
                className="relative bg-white/20 hover:bg-white/30 shadow-md text-white"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-4 w-4" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-green-500 text-white animate-pulse">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Carousel - Always show in categories view when promotions exist */}
      {viewMode === "categories" && promotions.length > 0 && (
        <div className="w-full bg-gradient-to-b from-green-50/50 to-transparent py-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div
              ref={carouselRef}
              className="relative overflow-hidden rounded-3xl shadow-2xl group"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Carousel slides */}
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {promotions.map((promotion) => (
                  <div key={promotion.id} className="min-w-full relative">
                    <div className="aspect-[16/7] md:aspect-[21/9] relative overflow-hidden">
                      <img
                        src={getPromotionImage(promotion)}
                        alt={getPromotionText(promotion, "title")}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-16">
                        <div className="max-w-2xl">
                          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                            {getPromotionText(promotion, "title")}
                          </h2>
                          <p className="text-sm md:text-lg lg:text-xl text-white/90 mb-4 md:mb-6 leading-relaxed">
                            {getPromotionText(promotion, "description")}
                          </p>
                          <Button
                            size="lg"
                            onClick={() => handlePromotionClick(promotion)}
                            className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold"
                          >
                            {t.learnMore}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 md:p-3 transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 md:p-3 transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              {/* Indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {promotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide ? "bg-white w-8 h-2" : "bg-white/50 hover:bg-white/70 w-2 h-2"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 pb-32">
        {/* Debug information */}
        {(categoriesError || allMenuItemsError || promotionsError) && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">API Errors:</h3>
            {categoriesError && <p className="text-red-700">Categories: {categoriesError.toString()}</p>}
            {allMenuItemsError && <p className="text-red-700">Menu Items: {allMenuItemsError.toString()}</p>}
            {promotionsError && <p className="text-red-700">Promotions: {promotionsError.toString()}</p>}
          </div>
        )}
        
        
        {/* Loading states */}
        {(categoriesLoading || allMenuItemsLoading || promotionsLoading) && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        )}

        {viewMode === "categories" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories && categories.map((category) => (
              <Card
                key={category.id}
                className="menu-card hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden group"
                onClick={() => handleCategoryClick(category.id.toString())}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={getCategoryImage(category)}
                    alt={getCategoryName(category)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-4xl md:text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-center px-2">{getCategoryName(category)}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "products" && (
          <>
            {!selectedCategory ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <div className="text-xl text-muted-foreground font-medium">
                  {language === "uz" ? "Kategoriya tanlang" : language === "ru" ? "Выберите категорию" : "Select a category"}
                </div>
                <div className="text-muted-foreground mt-2">
                  {language === "uz" ? "Mahsulotlarni ko'rish uchun kategoriya tanlang" : language === "ru" ? "Выберите категорию для просмотра товаров" : "Select a category to view products"}
                </div>
                <Button 
                  onClick={handleBackToCategories}
                  className="mt-4"
                  variant="outline"
                >
                  {language === "uz" ? "Kategoriyalarga qaytish" : language === "ru" ? "Вернуться к категориям" : "Back to Categories"}
                </Button>
              </div>
            ) : (
              <>
                {/* Show selected category name */}
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {(() => {
                      const category = categories.find(cat => cat.id === parseInt(selectedCategory))
                      if (category) {
                        return language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name
                      }
                      return ""
                    })()}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === "uz" ? "Kategoriya mahsulotlari" : language === "ru" ? "Товары категории" : "Category products"}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="relative search-glow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder={language === "uz" ? "🔍 Kategoriya bo'yicha qidirish..." : language === "ru" ? "🔍 Поиск по категории..." : "🔍 Search in category..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-12 h-14 text-lg rounded-2xl border-2 border-border/50 focus:border-primary bg-card shadow-lg"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  id={`dish-${item.id}`}
                  className="menu-card hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden"
                >
                  <div onClick={() => handleItemClick(item)}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={getMenuItemImage(item)}
                        alt={getLocalizedName(item)}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="text-sm text-green-600 font-bold">
                          {formatPrice(item.price)}
                        </div>
                        {/* Show promotion badge if there is any active promotion affecting this item */}
                        {promotions.some((promo: any) => {
                          const isPromoActive = promo.active || promo.is_active
                          if (!isPromoActive) return false
                          // linked_dish may be an object or an id (number)
                          const matchesLinkedDish = promo.linked_dish
                            ? (typeof promo.linked_dish === 'object' && promo.linked_dish !== null
                                ? promo.linked_dish.id === item.id
                                : promo.linked_dish === item.id)
                            : false
                          // If promotion targets a whole category, show badge for items in that category
                          const matchesCategory = promo.category ? item.category === promo.category : false
                          return matchesLinkedDish || matchesCategory
                        }) && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
                            {language === "uz" ? "Aksiya" : language === "ru" ? "Акция" : "Promo"}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        {item.rating && (
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{item.rating}</span>
                          </div>
                        )}
                        {item.prep_time && (
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <Clock className="h-4 w-4" />
                            <span className="font-semibold">{item.prep_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardHeader className="pb-4 pt-6">
                      <CardTitle className="text-xl font-bold text-foreground leading-tight">
                        {getLocalizedName(item)}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {getLocalizedDescription(item)}
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="pt-0 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cart.items.find((cartItem) => cartItem.menu_item === item.id) ? (
                          <div className="flex items-center gap-3 bg-muted rounded-2xl p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async (e) => {
                                e.stopPropagation()
                                const cartItem = cart.items.find((ci) => ci.menu_item === item.id)
                                if (cartItem) {
                                  await updateCartQuantity(item.id, cartItem.quantity - 1)
                                }
                              }}
                              className="h-8 w-8 rounded-xl hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold text-lg min-w-[24px] text-center text-primary">
                              {cart.items.find((cartItem) => cartItem.menu_item === item.id)?.quantity || 0}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async (e) => {
                                e.stopPropagation()
                                const cartItem = cart.items.find((ci) => ci.menu_item === item.id)
                                if (cartItem) {
                                  await updateCartQuantity(item.id, cartItem.quantity + 1)
                                }
                              }}
                              className="h-8 w-8 rounded-xl hover:bg-primary hover:text-primary-foreground"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            onClick={async (e) => {
                              e.stopPropagation()
                              await addToCart(item)
                            }}
                            disabled={isAddingToCart}
                            className="rounded-2xl px-6 py-2 bg-primary hover:bg-primary/90 shadow-lg font-semibold"
                          >
                            {isAddingToCart ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            {isAddingToCart ? (language === "uz" ? "Qo'shilmoqda..." : language === "ru" ? "Добавление..." : "Adding...") : t.add}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="text-xl text-muted-foreground font-medium">{t.notFound}</div>
                    <div className="text-muted-foreground mt-2">{t.tryAgain}</div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {cart.total_items >= 1 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
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

      {/* Dish Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {modalDish ? getLocalizedName(modalDish) : "Dish Details"}
            </DialogTitle>
            <DialogDescription>
              {modalDish ? getLocalizedDescription(modalDish) : "View detailed information about this dish"}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="absolute top-0 right-0 z-10 h-8 w-8 p-0 rounded-full hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
            
            {modalDish && (
              <div className="space-y-6">
                {/* Dish Image */}
                <div className="aspect-[16/9] relative overflow-hidden rounded-2xl">
                  <img
                    src={getMenuItemImage(modalDish)}
                    alt={getLocalizedName(modalDish)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <div className="text-lg text-green-600 font-bold">
                      {formatPrice(modalDish.price)}
                    </div>
                  </div>
                </div>

                {/* Dish Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-foreground">
                      {getLocalizedName(modalDish)}
                    </h2>
                    {modalDish.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-lg font-semibold">{modalDish.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {getLocalizedDescription(modalDish)}
                  </p>

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(modalDish.price)}
                    </div>
                    <div className="flex items-center gap-3">
                      {cart.items.find((cartItem) => cartItem.menu_item === modalDish.id) ? (
                        <div className="flex items-center gap-3 bg-muted rounded-2xl p-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async (e) => {
                              e.stopPropagation()
                              await removeFromCart(modalDish.id)
                            }}
                            className="h-8 w-8 p-0 rounded-full hover:bg-background"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-semibold min-w-[2rem] text-center">
                            {cart.items.find((cartItem) => cartItem.menu_item === modalDish.id)?.quantity || 0}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async (e) => {
                              e.stopPropagation()
                              await addToCart(modalDish)
                            }}
                            className="h-8 w-8 p-0 rounded-full hover:bg-background"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await addToCart(modalDish)
                          }}
                          className="bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 px-6 py-2 rounded-full font-semibold"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {language === "uz" ? "Savatchaga qo'shish" : language === "ru" ? "Добавить в корзину" : "Add to Cart"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
