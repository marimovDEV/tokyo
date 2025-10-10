"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StatusSwitch } from "@/components/ui/status-switch"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  LogOut,
  ChefHat,
  FolderOpen,
  Upload,
  Megaphone,
  MessageSquare,
  Check,
  X,
  Star,
  Info,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/toast"
import { useConfirmationModal } from "@/components/ui/confirmation-modal"

interface MenuItem {
  id: number
  name: string
  name_uz: string
  name_ru: string
  price: string | number
  category: number | {
    id: number
    name: string
    name_uz: string
    name_ru: string
  }
  category_name?: string
  category_name_uz?: string
  category_name_ru?: string
  available: boolean
  is_active: boolean
  image: string
  rating: number
  prep_time: string | number | null
  ingredients: string[] | string
  ingredients_uz: string[] | string
  ingredients_ru: string[] | string
}

interface Category {
  id: number
  name: string
  name_uz: string
  name_ru: string
  icon: string
  image: string
  is_active: boolean
}

interface Promotion {
  id: number
  title: string
  title_uz: string
  title_ru: string
  description: string
  description_uz: string
  description_ru: string
  image: string
  active: boolean
  is_active: boolean
  category: number
  linked_dish: number | null | { id: number; name: string; name_uz: string; name_ru: string; image_url: string }
}

interface Review {
  id: string
  name: string
  surname: string
  comment: string
  rating: number
  date: string
  approved: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const { showConfirmation, ConfirmationModal } = useConfirmationModal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [language, setLanguage] = useState<"en" | "uz" | "ru">("uz")
  const [activeTab, setActiveTab] = useState<string>("menu")

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [pendingReviews, setPendingReviews] = useState<Review[]>([])
  const [rejectedReviews, setRejectedReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [originalImage, setOriginalImage] = useState<string>("")

  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isAddingPromotion, setIsAddingPromotion] = useState(false)

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    name_uz: "",
    name_ru: "",
    ingredients: "",
    ingredients_uz: "",
    ingredients_ru: "",
    price: 0,
    category: 1,
    available: true,
    is_active: true,
    image: "",
    prep_time: "",
    rating: null,
  })
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    name_uz: "",
    name_ru: "",
    icon: "🍽️",
    image: "",
    is_active: true,
  })
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    title: "",
    title_uz: "",
    title_ru: "",
    description: "",
    description_uz: "",
    description_ru: "",
    image: "",
    active: true,
    is_active: true,
    category: 1,
    linked_dish: 1,
  })


  const [ingredientInputUz, setIngredientInputUz] = useState("")
  const [ingredientInputRu, setIngredientInputRu] = useState("")
  const [ingredientInputEn, setIngredientInputEn] = useState("")
  
  // State for category-specific menu items in promotion form
  const [categoryMenuItems, setCategoryMenuItems] = useState<MenuItem[]>([])
  const [loadingMenuItems, setLoadingMenuItems] = useState(false)


  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem("admin-auth")
    if (authToken === "true") {
      setIsAuthenticated(true)
      fetchData()
      loadReviews()
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from backend first
      try {
        // First try with show_all parameter
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        let [menuResponse, categoriesResponse, promotionsResponse] = await Promise.all([
          fetch(`${apiUrl}/menu-items/?show_all=true`),
          fetch(`${apiUrl}/categories/?show_all=true`),
          fetch(`${apiUrl}/promotions/?show_all=true`)
        ])

        // If show_all doesn't work, try without it
        if (!menuResponse.ok || !categoriesResponse.ok || !promotionsResponse.ok) {
          console.log("show_all parameter not supported, trying without it")
          ;[menuResponse, categoriesResponse, promotionsResponse] = await Promise.all([
            fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/"),
            fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/"),
            fetch("${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/")
          ])
        }

        if (menuResponse.ok) {
          const menuData = await menuResponse.json()
          console.log("Menu data:", menuData.results || menuData)
          setMenuItems(menuData.results || menuData)
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.results || categoriesData)
        }

        if (promotionsResponse.ok) {
          const promotionsData = await promotionsResponse.json()
          setPromotions(promotionsData.results || promotionsData)
        }
      } catch (backendError) {
        console.log("Backend not available, using mock data")
        
        // Use mock data if backend is not available
        const mockMenuItems: MenuItem[] = [
          {
            id: 1,
            name: "Grilled Chicken",
            name_uz: "Qovurilgan Tovuq",
            name_ru: "Жареная курица",
            description: "Tender grilled chicken breast with herbs",
            description_uz: "Zamonaviy o'tlar bilan qovurilgan yumshoq tovuq ko'kragi",
            description_ru: "Нежная жареная куриная грудка с травами",
            price: 45000,
            category: { id: 1, name: "Main Dishes", name_uz: "Asosiy Taomlar", name_ru: "Основные блюда", icon: "🍖", image: "/placeholder.jpg", is_active: true },
            available: true,
            is_active: true,
            image: "/placeholder.jpg",
            prep_time: 20,
            rating: 4.8,
            ingredients: "Chicken breast, herbs, olive oil",
            ingredients_uz: "Tovuq ko'kragi, o'tlar, zaytun moyi",
            ingredients_ru: "Куриная грудка, травы, оливковое масло",
          },
          {
            id: 2,
            name: "Caesar Salad",
            name_uz: "Sezar Salat",
            name_ru: "Салат Цезарь",
            description: "Fresh romaine lettuce with caesar dressing",
            description_uz: "Sezar sousi bilan yangi romaine salat",
            description_ru: "Свежий салат ромэн с соусом цезарь",
            price: 25000,
            category: { id: 2, name: "Salads", name_uz: "Salatlar", name_ru: "Салаты", icon: "🥗", image: "/placeholder.jpg", is_active: true },
            available: true,
            is_active: false,
            image: "/placeholder.jpg",
            prep_time: 10,
            rating: 4.5,
            ingredients: "Romaine lettuce, parmesan, croutons",
            ingredients_uz: "Romaine salat, parmezan, krutonlar",
            ingredients_ru: "Салат ромэн, пармезан, гренки",
          }
        ]

        const mockCategories: Category[] = [
          {
            id: 1,
            name: "Main Dishes",
            name_uz: "Asosiy Taomlar",
            name_ru: "Основные блюда",
            icon: "🍖",
            image: "/placeholder.jpg",
            is_active: true,
          },
          {
            id: 2,
            name: "Salads",
            name_uz: "Salatlar",
            name_ru: "Салаты",
            icon: "🥗",
            image: "/placeholder.jpg",
            is_active: false,
          }
        ]

        const mockPromotions: Promotion[] = [
          {
            id: 1,
            title: "Summer Special",
            title_uz: "Yozgi Maxsus",
            title_ru: "Летнее специальное",
            description: "Special summer menu items",
            description_uz: "Maxsus yozgi menyu taomlari",
            description_ru: "Специальные летние блюда",
            image: "/placeholder.jpg",
            active: true,
            is_active: false,
            category: 1,
            linked_dish: 1,
          }
        ]

        setMenuItems(mockMenuItems)
        setCategories(mockCategories)
        setPromotions(mockPromotions)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-auth")
    router.push("/admin/login")
  }

  const handleDeleteItem = async (itemId: number) => {
    // Find related promotions
    const relatedPromotions = promotions.filter(promo => {
      if (typeof promo.linked_dish === 'object' && promo.linked_dish !== null) {
        return promo.linked_dish.id === itemId
      }
      return promo.linked_dish === itemId
    })
    
    showConfirmation({
      title: language === "uz" ? "Taomni o'chirishni xohlaysizmi?" : language === "ru" ? "Удалить блюдо?" : "Delete dish?",
      description: language === "uz" 
        ? `Bu taom butunlay o'chiriladi va qayta tiklanmaydi.\n\nO'chiriladigan elementlar:\n• Taom: 1 ta\n• Aksiyalar: ${relatedPromotions.length} ta`
        : language === "ru"
          ? `Это блюдо будет полностью удалено и не может быть восстановлено.\n\nУдаляемые элементы:\n• Блюдо: 1 шт\n• Акции: ${relatedPromotions.length} шт`
          : `This dish will be permanently deleted and cannot be recovered.\n\nItems to be deleted:\n• Menu item: 1\n• Promotions: ${relatedPromotions.length}`,
      confirmText: language === "uz" ? "Barchasini o'chirish" : language === "ru" ? "Удалить все" : "Delete all",
      cancelText: language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
      try {
        // Try backend first - Django will handle cascade delete automatically
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/${itemId}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            console.log('✅ Menu item deleted successfully, refreshing data...')
            await fetchData() // Refresh data from backend
            console.log('✅ Data refreshed. Current promotions:', promotions.length)
            addToast({
              type: "success",
              description: language === "uz"
                ? `Taom va bog'langan ${relatedPromotions.length} ta aksiya o'chirildi!`
                : language === "ru"
                  ? `Блюдо и связанные ${relatedPromotions.length} акций удалены!`
                  : `Menu item and related ${relatedPromotions.length} promotions deleted!`,
            })
            return
          }
        } catch (backendError) {
          console.log("Backend delete failed, using local state")
        }

        // Local fallback: remove from state in cascade order
        // 1. Remove related promotions
        setPromotions((prev) => prev.filter((promo) => {
          if (typeof promo.linked_dish === 'object' && promo.linked_dish !== null) {
            return promo.linked_dish.id !== itemId
          }
          return promo.linked_dish !== itemId
        }))
        
        // 2. Remove menu item
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId))
        
        addToast({
          type: "success",
          description: language === "uz"
            ? `Taom va bog'langan ${relatedPromotions.length} ta aksiya o'chirildi! (Local)`
            : language === "ru"
              ? `Блюдо и связанные ${relatedPromotions.length} акций удалены! (Локально)`
              : `Menu item and related ${relatedPromotions.length} promotions deleted! (Local)`,
        })
      } catch (error) {
        console.error("Error deleting item:", error)
        addToast({
          type: "error",
          description: "An unexpected error occurred while deleting the item."
        })
      }
      }
    })
  }

  const handleDeleteCategory = async (categoryId: number) => {
    // Find related menu items and promotions
    const relatedMenuItems = menuItems.filter(item => item.category.id === categoryId)
    const relatedPromotions = promotions.filter(promo => 
      relatedMenuItems.some(item => {
        if (typeof promo.linked_dish === 'object' && promo.linked_dish !== null) {
          return item.id === promo.linked_dish.id
        }
        return item.id === promo.linked_dish
      })
    )
    
    showConfirmation({
      title: language === "uz"
        ? "Kategoriyani o'chirishni xohlaysizmi?"
        : language === "ru"
          ? "Удалить категорию?"
          : "Delete category?",
      description: language === "uz"
        ? `Bu kategoriya butunlay o'chiriladi va qayta tiklanmaydi.\n\nO'chiriladigan elementlar:\n• Kategoriya: 1 ta\n• Taomlar: ${relatedMenuItems.length} ta\n• Aksiyalar: ${relatedPromotions.length} ta`
        : language === "ru"
          ? `Эта категория будет полностью удалена и не может быть восстановлена.\n\nУдаляемые элементы:\n• Категория: 1 шт\n• Блюда: ${relatedMenuItems.length} шт\n• Акции: ${relatedPromotions.length} шт`
          : `This category will be permanently deleted and cannot be recovered.\n\nItems to be deleted:\n• Category: 1\n• Menu items: ${relatedMenuItems.length}\n• Promotions: ${relatedPromotions.length}`,
      confirmText: language === "uz" ? "Barchasini o'chirish" : language === "ru" ? "Удалить все" : "Delete all",
      cancelText: language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
      try {
        // Try backend first - Django will handle cascade delete automatically
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/${categoryId}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            console.log('✅ Category deleted successfully, refreshing data...')
            await fetchData() // Refresh data from backend
            console.log('✅ Data refreshed. Current menu items:', menuItems.length, 'Current promotions:', promotions.length)
            addToast({
              type: "success",
              description: language === "uz"
                ? `Kategoriya va bog'langan ${relatedMenuItems.length} ta taom, ${relatedPromotions.length} ta aksiya o'chirildi!`
                : language === "ru"
                  ? `Категория и связанные ${relatedMenuItems.length} блюд, ${relatedPromotions.length} акций удалены!`
                  : `Category and related ${relatedMenuItems.length} menu items, ${relatedPromotions.length} promotions deleted!`,
            })
            return
          }
        } catch (backendError) {
          console.log("Backend delete failed, using local state")
        }

        // Local fallback: remove from state in cascade order
        // 1. Remove related promotions
        setPromotions((prev) => prev.filter((promo) => 
          !relatedMenuItems.some(item => {
            if (typeof promo.linked_dish === 'object' && promo.linked_dish !== null) {
              return item.id === promo.linked_dish.id
            }
            return item.id === promo.linked_dish
          })
        ))
        
        // 2. Remove related menu items
        setMenuItems((prev) => prev.filter((item) => item.category.id !== categoryId))
        
        // 3. Remove category
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
        
        addToast({
          type: "success",
          description: language === "uz"
            ? `Kategoriya va bog'langan ${relatedMenuItems.length} ta taom, ${relatedPromotions.length} ta aksiya o'chirildi! (Local)`
            : language === "ru"
              ? `Категория и связанные ${relatedMenuItems.length} блюд, ${relatedPromotions.length} акций удалены! (Локально)`
              : `Category and related ${relatedMenuItems.length} menu items, ${relatedPromotions.length} promotions deleted! (Local)`,
        })
      } catch (error) {
        console.error("Error deleting category:", error)
        addToast({
          type: "error",
          description: "An unexpected error occurred while deleting the category."
        })
      }
      }
    })
  }

  const handleDeletePromotion = async (promotionId: number) => {
    showConfirmation({
      title: language === "uz"
        ? "Aksiyani o'chirishni xohlaysizmi?"
        : language === "ru"
          ? "Удалить акцию?"
          : "Delete promotion?",
      description: language === "uz"
        ? "Bu aksiya butunlay o'chiriladi va qayta tiklanmaydi.\n\nO'chiriladigan elementlar:\n• Aksiya: 1 ta"
        : language === "ru"
          ? "Эта акция будет полностью удалена и не может быть восстановлена.\n\nУдаляемые элементы:\n• Акция: 1 шт"
          : "This promotion will be permanently deleted and cannot be recovered.\n\nItems to be deleted:\n• Promotion: 1",
      confirmText: language === "uz" ? "O'chirish" : language === "ru" ? "Удалить" : "Delete",
      cancelText: language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
      try {
        // Try backend first
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/${promotionId}/`, {
            method: "DELETE",
          })

          if (response.ok) {
            addToast({
              type: "success",
              description: language === "uz"
                ? "Aksiya muvaffaqiyatli o'chirildi!"
                : language === "ru"
                  ? "Акция успешно удалена!"
                  : "Promotion deleted successfully!",
            })
            fetchData() // Refresh data
            return
          }
        } catch (backendError) {
          // Use local state if backend is not available
          setPromotions(prev => prev.filter(promo => promo.id !== promotionId))
          addToast({
            type: "success",
            description: language === "uz"
              ? "Aksiya muvaffaqiyatli o'chirildi! (Local)"
              : language === "ru"
                ? "Акция успешно удалена! (Локально)"
                : "Promotion deleted successfully! (Local)",
          })
        }
      } catch (error) {
        console.error("Error deleting promotion:", error)
        addToast({
          type: "error",
          description: "An unexpected error occurred while deleting the promotion."
        })
      }
      }
    })
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setOriginalImage(item.image)
    setNewItem({
      name: item.name,
      name_uz: item.name_uz,
      name_ru: item.name_ru,
      description: item.description,
      description_uz: item.description_uz,
      description_ru: item.description_ru,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      category: typeof item.category === 'number' ? item.category : item.category.id,
      available: item.available,
      is_active: item.is_active,
      image: item.image,
      prep_time: item.prep_time != null ? String(item.prep_time) : "",
      rating: item.rating,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients,
      ingredients_uz: Array.isArray(item.ingredients_uz) ? item.ingredients_uz.join(', ') : item.ingredients_uz,
      ingredients_ru: Array.isArray(item.ingredients_ru) ? item.ingredients_ru.join(', ') : item.ingredients_ru,
    })
    setIsAddingItem(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({
      name: category.name,
      name_uz: category.name_uz,
      name_ru: category.name_ru,
      icon: category.icon,
      image: category.image,
      is_active: category.is_active,
    })
    setIsAddingCategory(true)
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setNewPromotion({
      title: promotion.title,
      title_uz: promotion.title_uz,
      title_ru: promotion.title_ru,
      description: promotion.description,
      description_uz: promotion.description_uz,
      description_ru: promotion.description_ru,
      image: promotion.image,
      active: promotion.active,
      is_active: promotion.is_active,
      category: promotion.category,
      linked_dish: promotion.linked_dish || 1,
    })
    // Fetch menu items for the promotion's category when editing
    fetchMenuItemsByCategory(promotion.category)
    setIsAddingPromotion(true)
  }

  const addIngredient = () => {
    if (ingredientInputUz && ingredientInputRu && ingredientInputEn) {
      setNewItem({
        ...newItem,
        ingredients_uz: [...(newItem.ingredients_uz || []), ingredientInputUz],
        ingredients_ru: [...(newItem.ingredients_ru || []), ingredientInputRu],
        ingredients: [...(newItem.ingredients || []), ingredientInputEn],
      })
      setIngredientInputUz("")
      setIngredientInputRu("")
      setIngredientInputEn("")
    }
  }

  const removeIngredient = (index: number) => {
    setNewItem({
      ...newItem,
      ingredients_uz: newItem.ingredients_uz?.filter((_, i) => i !== index) || [],
      ingredients_ru: newItem.ingredients_ru?.filter((_, i) => i !== index) || [],
      ingredients: newItem.ingredients?.filter((_, i) => i !== index) || [],
    })
  }

  const fetchMenuItemsByCategory = async (categoryId: number) => {
    if (!categoryId) {
      setCategoryMenuItems([])
      setNewPromotion({ ...newPromotion, linked_dish: 1 })
      return
    }
    
    setLoadingMenuItems(true)
    try {
      // Try the specific category endpoint first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/${categoryId}/menu-items/`)
      if (response.ok) {
        const data = await response.json()
        setCategoryMenuItems(data.results || data)
      } else {
        // Fallback to general menu-items endpoint with category filter
        const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/?category=${categoryId}`)
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          setCategoryMenuItems(data.results || data)
        } else {
          console.error('Failed to fetch menu items for category:', categoryId)
          setCategoryMenuItems([])
        }
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setCategoryMenuItems([])
    } finally {
      setLoadingMenuItems(false)
    }
  }

  const handleClosePromotionDialog = () => {
    setIsAddingPromotion(false)
    setEditingPromotion(null)
    setCategoryMenuItems([])
    setLoadingMenuItems(false)
    setNewPromotion({
      title: "",
      title_uz: "",
      title_ru: "",
      description: "",
      description_uz: "",
      description_ru: "",
      image: "",
      active: true,
      is_active: true,
      category: 1,
      linked_dish: 1,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "item" | "category" | "promotion") => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        addToast({
          type: "warning",
          description: language === "uz"
            ? "Rasm hajmi 5MB dan oshmasligi kerak"
            : language === "ru"
              ? "Размер изображения не должен превышать 5MB"
              : "Image size should not exceed 5MB",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        if (type === "item") {
          setNewItem({ ...newItem, image: imageUrl })
        } else if (type === "category") {
          setNewCategory({ ...newCategory, image: imageUrl })
        } else if (type === "promotion") {
          setNewPromotion({ ...newPromotion, image: imageUrl })
        }
      }
      reader.readAsDataURL(file)
    }
  }


  const handleToggleActive = async (type: 'menu' | 'category' | 'promotion', id: number, isActive: boolean) => {
    try {
      // Try backend first
      try {
        let endpoint = ''
        let data = {}
        
        switch (type) {
          case 'menu':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/${id}/`
            data = { is_active: isActive }
            break
          case 'category':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/${id}/`
            data = { is_active: isActive }
            break
          case 'promotion':
            endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/${id}/`
            data = { is_active: isActive }
            break
        }

        let response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(data),
        })

        // Fallback for 415 Unsupported Media Type: retry with FormData (some DRF configs require it)
        if (response.status === 415) {
          console.log('Retrying with FormData due to 415 error for', type, id, 'with data:', data)
          const form = new FormData()
          Object.entries(data as Record<string, any>).forEach(([k, v]) => {
            form.append(k, String(v))
          })
          response = await fetch(endpoint, {
            method: 'PATCH',
            body: form,
          })
          console.log('FormData retry response status:', response.status)
        }

        if (response.ok) {
          addToast({
            type: "success",
            description: language === "uz"
              ? `${type === 'menu' ? 'Taom' : type === 'category' ? 'Kategoriya' : 'Aksiya'} ${isActive ? 'faollashtirildi' : 'deaktivlashtirildi'}`
              : language === "ru"
                ? `${type === 'menu' ? 'Блюдо' : type === 'category' ? 'Категория' : 'Акция'} ${isActive ? 'активировано' : 'деактивировано'}`
                : `${type === 'menu' ? 'Dish' : type === 'category' ? 'Category' : 'Promotion'} ${isActive ? 'activated' : 'deactivated'}`,
          })
          fetchData() // Refresh data from backend
          return
        } else {
          console.error('Backend error:', response.status, response.statusText)
          // If backend fails, fall through to local state update
          throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
        }
      } catch (backendError) {
        console.error('Backend error in handleToggleActive:', backendError)
        // Use local state if backend is not available
        switch (type) {
          case 'menu':
            setMenuItems(prev => prev.map(item => 
              item.id === id ? { ...item, is_active: isActive } : item
            ))
            addToast({
              type: "success",
              description: language === "uz"
                ? `Taom ${isActive ? 'faollashtirildi' : 'deaktivlashtirildi'} (Local)`
                : language === "ru"
                  ? `Блюдо ${isActive ? 'активировано' : 'деактивировано'} (Локально)`
                  : `Dish ${isActive ? 'activated' : 'deactivated'} (Local)`,
            })
            break
          case 'category':
            setCategories(prev => prev.map(cat => 
              cat.id === id ? { ...cat, is_active: isActive } : cat
            ))
            // If category is deactivated, deactivate all items in that category
            if (!isActive) {
              setMenuItems(prev => prev.map(item => 
                item.category.id === id ? { ...item, is_active: false } : item
              ))
            }
            addToast({
              type: "success",
              description: language === "uz"
                ? `Kategoriya ${isActive ? 'faollashtirildi' : 'deaktivlashtirildi'} (Local)`
                : language === "ru"
                  ? `Категория ${isActive ? 'активирована' : 'деактивирована'} (Локально)`
                  : `Category ${isActive ? 'activated' : 'deactivated'} (Local)`,
            })
            break
          case 'promotion':
            setPromotions(prev => prev.map(promo => 
              promo.id === id ? { ...promo, is_active: isActive } : promo
            ))
            addToast({
              type: "success",
              description: language === "uz"
                ? `Aksiya ${isActive ? 'faollashtirildi' : 'deaktivlashtirildi'} (Local)`
                : language === "ru"
                  ? `Акция ${isActive ? 'активирована' : 'деактивирована'} (Локально)`
                  : `Promotion ${isActive ? 'activated' : 'deactivated'} (Local)`,
            })
            break
        }
      }
    } catch (error) {
      console.error("Error toggling active status:", error)
    }
  }

  const handleDelete = async (id: number, type: string) => {
    const typeNames = {
      menu: language === "uz" ? "taom" : language === "ru" ? "блюдо" : "dish",
      category: language === "uz" ? "kategoriya" : language === "ru" ? "категория" : "category",
      promotion: language === "uz" ? "aksiya" : language === "ru" ? "акция" : "promotion"
    }
    
    showConfirmation({
      title: language === "uz" 
        ? `${typeNames[type as keyof typeof typeNames]}ni o'chirishni xohlaysizmi?`
        : language === "ru"
          ? `Удалить ${typeNames[type as keyof typeof typeNames]}?`
          : `Delete this ${type}?`,
      description: language === "uz"
        ? `Bu ${typeNames[type as keyof typeof typeNames]} butunlay o'chiriladi va qayta tiklanmaydi.`
        : language === "ru"
          ? `Этот ${typeNames[type as keyof typeof typeNames]} будет полностью удален и не может быть восстановлен.`
          : `This ${type} will be permanently deleted and cannot be recovered.`,
      confirmText: language === "uz" ? "O'chirish" : language === "ru" ? "Удалить" : "Delete",
      cancelText: language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
    
    try {
      let endpoint = ''
      
      switch (type) {
        case 'menu':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/${id}/`
          break
        case 'category':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/${id}/`
          break
        case 'promotion':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/${id}/`
          break
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        switch (type) {
          case 'menu':
            setMenuItems(prev => prev.filter(item => item.id !== id))
            break
          case 'category':
            setCategories(prev => prev.filter(cat => cat.id !== id))
            break
          case 'promotion':
            setPromotions(prev => prev.filter(promo => promo.id !== id))
            break
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
    }
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m'
  }

  const loadReviews = async () => {
    try {
      // Try to fetch from backend first - use admin endpoint to get all reviews
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/admin/reviews/`)
      if (response.ok) {
        const data = await response.json()
        const allReviews: Review[] = data.results || data
        setReviews(allReviews)
        setPendingReviews(allReviews.filter((review) => !review.approved && !review.deleted))
        setRejectedReviews(allReviews.filter((review) => review.deleted))
        return
      }
    } catch (error) {
      console.log("Backend not available, using localStorage")
    }
    
    // Fallback to localStorage
    const savedReviews = localStorage.getItem("restaurant-reviews")
    if (savedReviews) {
      const allReviews: Review[] = JSON.parse(savedReviews)
      setReviews(allReviews)
      setPendingReviews(allReviews.filter((review) => !review.approved && !review.deleted))
      setRejectedReviews(allReviews.filter((review) => review.deleted))
    }
  }

  const handleApproveReview = async (reviewId: string) => {
    try {
      // Try backend first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reviews/${reviewId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true }),
      })
      
      if (response.ok) {
        await loadReviews() // Reload from backend
        addToast({
          type: "success",
          description: language === "uz"
            ? "Izoh tasdiqlandi!"
            : language === "ru"
              ? "Отзыв одобрен!"
              : "Review approved!",
        })
        return
      }
    } catch (error) {
      console.log("Backend not available, using localStorage")
    }
    
    // Fallback to localStorage
    const updatedReviews = reviews.map((review) => (review.id === reviewId ? { ...review, approved: true } : review))
    localStorage.setItem("restaurant-reviews", JSON.stringify(updatedReviews))
    setReviews(updatedReviews)
    setPendingReviews(updatedReviews.filter((review) => !review.approved))
    addToast({
      type: "success",
      description: language === "uz"
        ? "Izoh tasdiqlandi! (Local)"
        : language === "ru"
          ? "Отзыв одобрен! (Локально)"
          : "Review approved! (Local)",
    })
  }

  const handleRejectReview = async (reviewId: string) => {
    try {
      // Try backend first - mark as deleted instead of actually deleting
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reviews/${reviewId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleted: true }),
      })
      
      if (response.ok) {
        await loadReviews() // Reload from backend
        addToast({
          type: "success",
          description: language === "uz"
            ? "Izoh rad etildi!"
            : language === "ru"
              ? "Отзыв отклонен!"
              : "Review rejected!",
        })
        return
      }
    } catch (error) {
      console.log("Backend not available, using localStorage")
    }
    
    // Fallback to localStorage - remove from list
    const updatedReviews = reviews.filter((review) => review.id !== reviewId)
    localStorage.setItem("restaurant-reviews", JSON.stringify(updatedReviews))
    setReviews(updatedReviews)
    setPendingReviews(updatedReviews.filter((review) => !review.approved))
    addToast({
      type: "success",
      description: language === "uz"
        ? "Izoh rad etildi! (Local)"
        : language === "ru"
          ? "Отзыв отклонен! (Локально)"
          : "Review rejected! (Local)",
    })
  }

  const handleDeleteReview = async (reviewId: string) => {
    showConfirmation({
      title: language === "uz" ? "Izohni o'chirish" : language === "ru" ? "Удалить отзыв" : "Delete Review",
      description: language === "uz" 
        ? "Bu izohni butunlay o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi."
        : language === "ru"
          ? "Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить."
          : "Are you sure you want to delete this review? This action cannot be undone.",
      confirmText: language === "uz" ? "O'chirish" : language === "ru" ? "Удалить" : "Delete",
      cancelText: language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          // Try backend first
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reviews/${reviewId}/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            await loadReviews() // Reload from backend
            addToast({
              type: "success",
              description: language === "uz"
                ? "Izoh o'chirildi!"
                : language === "ru"
                  ? "Отзыв удален!"
                  : "Review deleted!",
            })
            return
          }
        } catch (error) {
          console.log("Backend not available, using localStorage")
        }
        
        // Fallback to localStorage - remove from list
        const updatedReviews = reviews.filter((review) => review.id !== reviewId)
        localStorage.setItem("restaurant-reviews", JSON.stringify(updatedReviews))
        setReviews(updatedReviews)
        setPendingReviews(updatedReviews.filter((review) => !review.approved))
        addToast({
          type: "success",
          description: language === "uz"
            ? "Izoh o'chirildi! (Local)"
            : language === "ru"
              ? "Отзыв удален! (Локально)"
              : "Review deleted! (Local)",
        })
      }
    })
  }

  const handleSaveItem = async () => {
    if (!newItem.name_uz || !newItem.name_ru || !newItem.name || !newItem.image) {
      addToast({
        type: "warning",
        description: language === "uz"
          ? "Iltimos, barcha asosiy maydonlarni to'ldiring (nomi va rasm)"
          : language === "ru"
            ? "Пожалуйста, заполните все основные поля (название и изображение)"
            : "Please fill all required fields (name and image)",
      })
      return
    }

    try {
      // Try backend first
      try {
        const method = editingItem ? 'PUT' : 'POST'
        const url = editingItem ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/${editingItem.id}/` : "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/menu-items/"
        
        // Always use FormData for menu items (needed for image uploads)
        const form = new FormData()
        console.log('Sending data:', newItem)
        
        Object.entries(newItem as Record<string, any>).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if (k === 'image' && typeof v === 'string') {
              if (v.startsWith('data:')) {
                // Convert data URL to blob for FormData (new image upload)
                const byteString = atob(v.split(',')[1])
                const mimeString = v.split(',')[0].split(':')[1].split(';')[0]
                const ab = new ArrayBuffer(byteString.length)
                const ia = new Uint8Array(ab)
                for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i)
                }
                const blob = new Blob([ab], { type: mimeString })
                form.append(k, blob, 'image.jpg')
              } else if (editingItem && v === originalImage) {
                // Skip unchanged image when editing (keep existing image)
                return
              } else {
                // Handle other image cases (URLs, etc.)
                form.append(k, String(v))
              }
            } else if (k.includes('ingredients')) {
              // Handle ingredients fields - always send as JSON array
              if (Array.isArray(v)) {
                form.append(k, JSON.stringify(v))
              } else if (typeof v === 'string' && v.trim() === '') {
                form.append(k, JSON.stringify([])) // Empty array for empty strings
              } else if (typeof v === 'string') {
                // Convert comma-separated string to array
                const ingredientsArray = v.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0)
                form.append(k, JSON.stringify(ingredientsArray))
              } else {
                form.append(k, JSON.stringify([])) // Default to empty array
              }
            } else {
              form.append(k, String(v))
            }
          }
        })
        
        // Debug FormData contents
        console.log('FormData contents:')
        for (let [key, value] of form.entries()) {
          console.log(key, value)
        }

        let response = await fetch(url, {
          method: method,
          body: form,
        })

        if (response.ok) {
          addToast({
            type: "success",
            description: language === "uz"
              ? editingItem ? "Taom muvaffaqiyatli yangilandi!" : "Taom muvaffaqiyatli qo'shildi!"
              : language === "ru"
                ? editingItem ? "Блюдо успешно обновлено!" : "Блюдо успешно добавлено!"
                : editingItem ? "Dish updated successfully!" : "Dish added successfully!",
          })
          fetchData()
        } else {
          // Show error details
          const errorText = await response.text()
          console.error('Backend error:', response.status, errorText)
          addToast({
            type: "error",
            description: language === "uz"
              ? `Xatolik: ${response.status} - ${errorText}`
              : language === "ru"
                ? `Ошибка: ${response.status} - ${errorText}`
                : `Error: ${response.status} - ${errorText}`
          })
        }
      } catch (backendError) {
        // Use local state if backend is not available
        const newId = editingItem ? editingItem.id : Math.max(...menuItems.map(item => item.id), 0) + 1
        const categoryObj = categories.find(cat => cat.id === newItem.category)
        
        const newMenuItem: MenuItem = {
          id: newId,
          name: newItem.name || "",
          name_uz: newItem.name_uz || "",
          name_ru: newItem.name_ru || "",
          description: newItem.description || "",
          description_uz: newItem.description_uz || "",
          description_ru: newItem.description_ru || "",
          price: newItem.price || 0,
          category: categoryObj || { id: 1, name: "Main Dishes", name_uz: "Asosiy Taomlar", name_ru: "Основные блюда", icon: "🍖", image: "/placeholder.jpg", is_active: true },
          available: newItem.available || true,
          is_active: newItem.is_active || true,
          image: newItem.image || "/placeholder.jpg",
          prep_time: newItem.prep_time || "",
          rating: newItem.rating || 5,
          ingredients: newItem.ingredients || "",
          ingredients_uz: newItem.ingredients_uz || "",
          ingredients_ru: newItem.ingredients_ru || "",
        }

        if (editingItem) {
          setMenuItems(prev => prev.map(item => item.id === editingItem.id ? newMenuItem : item))
          addToast({
            type: "success",
            description: language === "uz"
              ? "Taom muvaffaqiyatli yangilandi! (Local)"
              : language === "ru"
                ? "Блюдо успешно обновлено! (Локально)"
                : "Dish updated successfully! (Local)",
          })
    } else {
          setMenuItems(prev => [...prev, newMenuItem])
          addToast({
            type: "success",
            description: language === "uz"
              ? "Taom muvaffaqiyatli qo'shildi! (Local)"
              : language === "ru"
                ? "Блюдо успешно добавлено! (Локально)"
                : "Dish added successfully! (Local)",
          })
        }
      }

      setIsAddingItem(false)
      setNewItem({
        name: "",
        name_uz: "",
        name_ru: "",
        ingredients: "",
        ingredients_uz: "",
        ingredients_ru: "",
        price: 0,
        category: 1,
        available: true,
        is_active: true,
        image: "",
        prep_time: "",
        rating: null,
      })
      setEditingItem(null)
      setOriginalImage("")
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleSaveCategory = async () => {
    if (!newCategory.name_uz || !newCategory.name_ru || !newCategory.name || !newCategory.image) {
      addToast({
        type: "warning",
        description: language === "uz"
          ? "Iltimos, barcha maydonlarni to'ldiring"
          : language === "ru"
            ? "Пожалуйста, заполните все поля"
            : "Please fill all fields",
      })
      return
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const url = editingCategory ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/${editingCategory.id}/` : "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/categories/"
      
      // Always use FormData for categories (needed for image uploads)
      const form = new FormData()
      console.log('Sending category data:', newCategory)
      
      Object.entries(newCategory as Record<string, any>).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (k === 'image' && typeof v === 'string' && v.startsWith('data:')) {
            // Convert data URL to blob for FormData
            const byteString = atob(v.split(',')[1])
            const mimeString = v.split(',')[0].split(':')[1].split(';')[0]
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mimeString })
            form.append(k, blob, 'image.jpg')
          } else {
            form.append(k, String(v))
          }
        }
      })

      let response = await fetch(url, {
        method: method,
        body: form,
      })

      if (response.ok) {
        addToast({
          type: "success",
          description: language === "uz"
            ? editingCategory ? "Kategoriya muvaffaqiyatli yangilandi!" : "Kategoriya muvaffaqiyatli qo'shildi!"
            : language === "ru"
              ? editingCategory ? "Категория успешно обновлена!" : "Категория успешно добавлена!"
              : editingCategory ? "Category updated successfully!" : "Category added successfully!",
        })
        fetchData()
        setIsAddingCategory(false)
        setNewCategory({
          name: "",
          name_uz: "",
          name_ru: "",
          icon: "🍽️",
          image: "",
          is_active: true,
        })
        setEditingCategory(null)
      } else {
        // Show error details
        const errorText = await response.text()
        console.error('Category backend error:', response.status, errorText)
        addToast({
          type: "error",
          description: language === "uz"
            ? `Kategoriya xatoligi: ${response.status} - ${errorText}`
            : language === "ru"
              ? `Ошибка категории: ${response.status} - ${errorText}`
              : `Category error: ${response.status} - ${errorText}`
        })
      }
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleSavePromotion = async () => {
    if (!newPromotion.title_uz || !newPromotion.title_ru || !newPromotion.title || !newPromotion.image) {
      addToast({
        type: "warning",
        description: language === "uz"
          ? "Iltimos, barcha maydonlarni to'ldiring"
          : language === "ru"
            ? "Пожалуйста, заполните все поля"
            : "Please fill all fields",
      })
      return
    }

    try {
      const method = editingPromotion ? 'PUT' : 'POST'
      const url = editingPromotion ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/${editingPromotion.id}/` : "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/promotions/"
      
      // Always use FormData for promotions (needed for image uploads)
      const form = new FormData()
      console.log('Sending promotion data:', newPromotion)
      
      Object.entries(newPromotion as Record<string, any>).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (k === 'image' && typeof v === 'string' && v.startsWith('data:')) {
            // Convert data URL to blob for FormData
            const byteString = atob(v.split(',')[1])
            const mimeString = v.split(',')[0].split(':')[1].split(';')[0]
            const ab = new ArrayBuffer(byteString.length)
            const ia = new Uint8Array(ab)
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i)
            }
            const blob = new Blob([ab], { type: mimeString })
            form.append(k, blob, 'image.jpg')
          } else {
            form.append(k, String(v))
          }
        }
      })

      let response = await fetch(url, {
        method: method,
        body: form,
      })

      if (response.ok) {
        addToast({
          type: "success",
          description: language === "uz"
            ? editingPromotion ? "Aksiya muvaffaqiyatli yangilandi!" : "Aksiya muvaffaqiyatli qo'shildi!"
            : language === "ru"
              ? editingPromotion ? "Акция успешно обновлена!" : "Акция успешно добавлена!"
              : editingPromotion ? "Promotion updated successfully!" : "Promotion added successfully!",
        })
        fetchData()
        setIsAddingPromotion(false)
        setNewPromotion({
          title: "",
          title_uz: "",
          title_ru: "",
          description: "",
          description_uz: "",
          description_ru: "",
          image: "",
          active: true,
          is_active: true,
          category: 1,
          linked_dish: 1,
        })
        setEditingPromotion(null)
      } else {
        // Show error details
        const errorText = await response.text()
        console.error('Promotion backend error:', response.status, errorText)
        addToast({
          type: "error",
          description: language === "uz"
            ? `Aksiya xatoligi: ${response.status} - ${errorText}`
            : language === "ru"
              ? `Ошибка акции: ${response.status} - ${errorText}`
              : `Promotion error: ${response.status} - ${errorText}`
        })
      }
    } catch (error) {
      console.error("Error saving promotion:", error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">
                {language === "uz" ? "Admin Panel" : language === "ru" ? "Админ Панель" : "Admin Panel"}
          </h1>
            </div>
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                <SelectTrigger className="w-20 bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">UZ</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-2" />
                {language === "uz" ? "Chiqish" : language === "ru" ? "Выйти" : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Add Item Dialog */}
        <Dialog open={isAddingItem} onOpenChange={(open) => {
          if (!open) {
            setIsAddingItem(false)
            setEditingItem(null)
            setOriginalImage("")
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem 
                  ? (language === "uz" ? "Taomni Tahrirlash" : language === "ru" ? "Редактировать блюдо" : "Edit Dish")
                  : (language === "uz" ? "Yangi Taom Qo'shish" : language === "ru" ? "Добавить новое блюдо" : "Add New Dish")
                }
              </DialogTitle>
              <DialogDescription>
                {language === "uz" 
                  ? "Taom ma'lumotlarini to'ldiring" 
                  : language === "ru" 
                    ? "Заполните информацию о блюде" 
                    : "Fill in the dish information"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{language === "uz" ? "Nomi (EN)" : language === "ru" ? "Название (EN)" : "Name (EN)"}</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder={language === "uz" ? "Taom nomi" : language === "ru" ? "Название блюда" : "Dish name"}
                  />
                </div>
                <div>
                  <Label htmlFor="name_uz">{language === "uz" ? "Nomi (UZ)" : language === "ru" ? "Название (UZ)" : "Name (UZ)"}</Label>
                  <Input
                    id="name_uz"
                    value={newItem.name_uz}
                    onChange={(e) => setNewItem({ ...newItem, name_uz: e.target.value })}
                    placeholder={language === "uz" ? "Taom nomi" : language === "ru" ? "Название блюда" : "Dish name"}
                  />
                </div>
        </div>

              <div>
                <Label htmlFor="name_ru">{language === "uz" ? "Nomi (RU)" : language === "ru" ? "Название (RU)" : "Name (RU)"}</Label>
                <Input
                  id="name_ru"
                  value={newItem.name_ru}
                  onChange={(e) => setNewItem({ ...newItem, name_ru: e.target.value })}
                  placeholder={language === "uz" ? "Taom nomi" : language === "ru" ? "Название блюда" : "Dish name"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{language === "uz" ? "Narx" : language === "ru" ? "Цена" : "Price"}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={newItem.price === 0 ? "" : newItem.price}
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value)
                      const safe = isNaN(parsed) ? 0 : Math.max(0, parsed)
                      setNewItem({ ...newItem, price: safe })
                    }}
                    placeholder={language === "uz" ? "Narx" : language === "ru" ? "Цена" : "Price"}
                  />
                </div>
                <div>
                  <Label htmlFor="category">{language === "uz" ? "Kategoriya" : language === "ru" ? "Категория" : "Category"}</Label>
                  <Select value={newItem.category.toString()} onValueChange={(value) => setNewItem({ ...newItem, category: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "uz" ? "Kategoriya tanlang" : language === "ru" ? "Выберите категорию" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prep_time">{language === "uz" ? "Tayyorlash vaqti (min)" : language === "ru" ? "Время приготовления (мин)" : "Prep Time (min)"}</Label>
                  <Input
                    id="prep_time"
                    type="text"
                    value={newItem.prep_time as string}
                    onChange={(e) => {
                      const raw = e.target.value
                      // Allow only digits and a single dash
                      const cleaned = raw.replace(/[^\d-]/g, "").replace(/-{2,}/g, "-")
                      setNewItem({ ...newItem, prep_time: cleaned })
                    }}
                    placeholder="15-20"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">{language === "uz" ? "Reyting" : language === "ru" ? "Рейтинг" : "Rating"}</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newItem.rating || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "") {
                        setNewItem({ ...newItem, rating: null })
                      } else {
                        const numValue = parseFloat(value)
                        if (numValue >= 0 && numValue <= 5) {
                          setNewItem({ ...newItem, rating: numValue })
                        }
                      }
                    }}
                    placeholder="4.5 (0-5 orasida)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="available">{language === "uz" ? "Mavjud" : language === "ru" ? "Доступно" : "Available"}</Label>
                  <Switch
                    id="available"
                    checked={newItem.available}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{language === "uz" ? "Tavsif (EN)" : language === "ru" ? "Описание (EN)" : "Description (EN)"}</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder={language === "uz" ? "Taom tavsifi" : language === "ru" ? "Описание блюда" : "Dish description"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_uz">{language === "uz" ? "Tavsif (UZ)" : language === "ru" ? "Описание (UZ)" : "Description (UZ)"}</Label>
                  <Textarea
                    id="description_uz"
                    value={newItem.description_uz}
                    onChange={(e) => setNewItem({ ...newItem, description_uz: e.target.value })}
                    placeholder={language === "uz" ? "Taom tavsifi" : language === "ru" ? "Описание блюда" : "Dish description"}
                  />
                </div>
                <div>
                  <Label htmlFor="description_ru">{language === "uz" ? "Tavsif (RU)" : language === "ru" ? "Описание (RU)" : "Description (RU)"}</Label>
                  <Textarea
                    id="description_ru"
                    value={newItem.description_ru}
                    onChange={(e) => setNewItem({ ...newItem, description_ru: e.target.value })}
                    placeholder={language === "uz" ? "Taom tavsifi" : language === "ru" ? "Описание блюда" : "Dish description"}
                  />
                </div>
              </div>

              <div>
                <Label>{language === "uz" ? "Tarkibi (ixtiyoriy)" : language === "ru" ? "Состав (необязательно)" : "Composition (optional)"}</Label>
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={ingredientInputUz}
                      onChange={(e) => setIngredientInputUz(e.target.value)}
                      placeholder="O'zbek tilida"
                    />
                    <Input
                      value={ingredientInputRu}
                      onChange={(e) => setIngredientInputRu(e.target.value)}
                      placeholder="На русском"
                    />
                    <Input
                      value={ingredientInputEn}
                      onChange={(e) => setIngredientInputEn(e.target.value)}
                      placeholder="In English"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addIngredient}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "uz"
                      ? "Tarkib qo'shish (ixtiyoriy)"
                      : language === "ru"
                        ? "Добавить в состав (необязательно)"
                        : "Add to Composition (optional)"}
                  </Button>
                  {newItem.ingredients_uz && newItem.ingredients_uz.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {newItem.ingredients_uz.map((ing, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <div className="grid grid-cols-3 gap-2 flex-1 text-sm">
                            <span>{ing}</span>
                            <span>{newItem.ingredients_ru?.[index]}</span>
                            <span>{newItem.ingredients?.[index]}</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeIngredient(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>


              <div>
                <Label>{language === "uz" ? "Rasm" : language === "ru" ? "Изображение" : "Image"}</Label>
                <Alert className="mt-2 mb-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {language === "uz"
                      ? "Format: JPG, PNG, WEBP | O'lcham: 800x600px (tavsiya) | Maksimal hajm: 5MB"
                      : language === "ru"
                        ? "Формат: JPG, PNG, WEBP | Размер: 800x600px (рекомендуется) | Макс. размер: 5MB"
                        : "Format: JPG, PNG, WEBP | Size: 800x600px (recommended) | Max size: 5MB"}
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-4">
                  {newItem.image && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={newItem.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, "item")}
                      className="hidden"
                      id="item-image"
                    />
                    <Label htmlFor="item-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                        <Upload className="h-4 w-4" />
                        {language === "uz"
                          ? "Rasm yuklash"
                          : language === "ru"
                            ? "Загрузить изображение"
                            : "Upload Image"}
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddingItem(false)
                setEditingItem(null)
                setOriginalImage("")
              }}>
                {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
              </Button>
              <Button onClick={handleSaveItem}>
                {editingItem 
                  ? (language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Update")
                  : (language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Category Dialog */}
        <Dialog open={isAddingCategory} onOpenChange={(open) => {
          if (!open) {
            setIsAddingCategory(false)
            setEditingCategory(null)
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory 
                  ? (language === "uz" ? "Kategoriyani Tahrirlash" : language === "ru" ? "Редактировать категорию" : "Edit Category")
                  : (language === "uz" ? "Yangi Kategoriya Qo'shish" : language === "ru" ? "Добавить новую категорию" : "Add New Category")
                }
              </DialogTitle>
              <DialogDescription>
                {language === "uz" 
                  ? "Kategoriya ma'lumotlarini to'ldiring" 
                  : language === "ru" 
                    ? "Заполните информацию о категории" 
                    : "Fill in the category information"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat_name">{language === "uz" ? "Nomi (EN)" : language === "ru" ? "Название (EN)" : "Name (EN)"}</Label>
                  <Input
                    id="cat_name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder={language === "uz" ? "Kategoriya nomi" : language === "ru" ? "Название категории" : "Category name"}
                  />
                </div>
                <div>
                  <Label htmlFor="cat_name_uz">{language === "uz" ? "Nomi (UZ)" : language === "ru" ? "Название (UZ)" : "Name (UZ)"}</Label>
                  <Input
                    id="cat_name_uz"
                    value={newCategory.name_uz}
                    onChange={(e) => setNewCategory({ ...newCategory, name_uz: e.target.value })}
                    placeholder={language === "uz" ? "Kategoriya nomi" : language === "ru" ? "Название категории" : "Category name"}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cat_name_ru">{language === "uz" ? "Nomi (RU)" : language === "ru" ? "Название (RU)" : "Name (RU)"}</Label>
                <Input
                  id="cat_name_ru"
                  value={newCategory.name_ru}
                  onChange={(e) => setNewCategory({ ...newCategory, name_ru: e.target.value })}
                  placeholder={language === "uz" ? "Kategoriya nomi" : language === "ru" ? "Название категории" : "Category name"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat_icon">{language === "uz" ? "Emoji belgisi" : language === "ru" ? "Emoji символ" : "Emoji Icon"}</Label>
                  <Input
                    id="cat_icon"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="🍽️"
                    maxLength={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="cat_active">{language === "uz" ? "Faol" : language === "ru" ? "Активно" : "Active"}</Label>
                  <Switch
                    id="cat_active"
                    checked={newCategory.is_active}
                    onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === "uz" ? "Rasm" : language === "ru" ? "Изображение" : "Image"}</Label>
                <Alert className="mt-2 mb-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {language === "uz"
                      ? "Format: JPG, PNG, WEBP | O'lcham: 1200x800px (tavsiya) | Maksimal hajm: 5MB"
                      : language === "ru"
                        ? "Формат: JPG, PNG, WEBP | Размер: 1200x800px (рекомендуется) | Макс. размер: 5MB"
                        : "Format: JPG, PNG, WEBP | Size: 1200x800px (recommended) | Max size: 5MB"}
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-4">
                  {newCategory.image && (
                    <div className="w-64 h-40 rounded-lg overflow-hidden border">
                      <img
                        src={newCategory.image || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageUpload(e, "category")}
                      className="hidden"
                      id="category-image"
                    />
                    <Label htmlFor="category-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                        <Upload className="h-4 w-4" />
                        {language === "uz"
                          ? "Rasm yuklash"
                          : language === "ru"
                            ? "Загрузить изображение"
                            : "Upload Image"}
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
              </Button>
              <Button onClick={handleSaveCategory}>
                {editingCategory 
                  ? (language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Update")
                  : (language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Promotion Dialog */}
        <Dialog open={isAddingPromotion} onOpenChange={(open) => {
          if (!open) {
            handleClosePromotionDialog()
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion 
                  ? (language === "uz" ? "Aksiyani Tahrirlash" : language === "ru" ? "Редактировать акцию" : "Edit Promotion")
                  : (language === "uz" ? "Yangi Aksiya Qo'shish" : language === "ru" ? "Добавить новую акцию" : "Add New Promotion")
                }
              </DialogTitle>
              <DialogDescription>
                {language === "uz" 
                  ? "Aksiya ma'lumotlarini to'ldiring" 
                  : language === "ru" 
                    ? "Заполните информацию об акции" 
                    : "Fill in the promotion information"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promo_title">{language === "uz" ? "Sarlavha (EN)" : language === "ru" ? "Заголовок (EN)" : "Title (EN)"}</Label>
                  <Input
                    id="promo_title"
                    value={newPromotion.title}
                    onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })}
                    placeholder={language === "uz" ? "Aksiya sarlavhasi" : language === "ru" ? "Заголовок акции" : "Promotion title"}
                  />
                </div>
                <div>
                  <Label htmlFor="promo_title_uz">{language === "uz" ? "Sarlavha (UZ)" : language === "ru" ? "Заголовок (UZ)" : "Title (UZ)"}</Label>
                  <Input
                    id="promo_title_uz"
                    value={newPromotion.title_uz}
                    onChange={(e) => setNewPromotion({ ...newPromotion, title_uz: e.target.value })}
                    placeholder={language === "uz" ? "Aksiya sarlavhasi" : language === "ru" ? "Заголовок акции" : "Promotion title"}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="promo_title_ru">{language === "uz" ? "Sarlavha (RU)" : language === "ru" ? "Заголовок (RU)" : "Title (RU)"}</Label>
                <Input
                  id="promo_title_ru"
                  value={newPromotion.title_ru}
                  onChange={(e) => setNewPromotion({ ...newPromotion, title_ru: e.target.value })}
                  placeholder={language === "uz" ? "Aksiya sarlavhasi" : language === "ru" ? "Заголовок акции" : "Promotion title"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promo_category">{language === "uz" ? "Kategoriya" : language === "ru" ? "Категория" : "Category"}</Label>
                  <Select 
                    value={newPromotion.category.toString()} 
                    onValueChange={(value) => {
                      const categoryId = parseInt(value)
                      setNewPromotion({ 
                        ...newPromotion, 
                        category: categoryId,
                        linked_dish: 1 // Reset linked dish when category changes
                      })
                      // Fetch menu items for the selected category
                      fetchMenuItemsByCategory(categoryId)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === "uz" ? "Kategoriya tanlang" : language === "ru" ? "Выберите категорию" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="promo_linked_dish">{language === "uz" ? "Bog'langan taom" : language === "ru" ? "Связанное блюдо" : "Linked Dish"}</Label>
                  <Select 
                    value={newPromotion.linked_dish?.toString() || ""} 
                    onValueChange={(value) => setNewPromotion({ ...newPromotion, linked_dish: parseInt(value) })}
                    disabled={!newPromotion.category || loadingMenuItems}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !newPromotion.category 
                            ? (language === "uz" ? "Avval kategoriya tanlang" : language === "ru" ? "Сначала выберите категорию" : "Select category first")
                            : loadingMenuItems
                            ? (language === "uz" ? "Yuklanmoqda..." : language === "ru" ? "Загрузка..." : "Loading...")
                            : (language === "uz" ? "Taom tanlang" : language === "ru" ? "Выберите блюдо" : "Select dish")
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryMenuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {language === "uz" ? item.name_uz : language === "ru" ? item.name_ru : item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="promo_description">{language === "uz" ? "Tavsif (EN)" : language === "ru" ? "Описание (EN)" : "Description (EN)"}</Label>
                <Textarea
                  id="promo_description"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                  placeholder={language === "uz" ? "Aksiya tavsifi" : language === "ru" ? "Описание акции" : "Promotion description"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="promo_description_uz">{language === "uz" ? "Tavsif (UZ)" : language === "ru" ? "Описание (UZ)" : "Description (UZ)"}</Label>
                  <Textarea
                    id="promo_description_uz"
                    value={newPromotion.description_uz}
                    onChange={(e) => setNewPromotion({ ...newPromotion, description_uz: e.target.value })}
                    placeholder={language === "uz" ? "Aksiya tavsifi" : language === "ru" ? "Описание акции" : "Promotion description"}
                  />
                </div>
                <div>
                  <Label htmlFor="promo_description_ru">{language === "uz" ? "Tavsif (RU)" : language === "ru" ? "Описание (RU)" : "Description (RU)"}</Label>
                  <Textarea
                    id="promo_description_ru"
                    value={newPromotion.description_ru}
                    onChange={(e) => setNewPromotion({ ...newPromotion, description_ru: e.target.value })}
                    placeholder={language === "uz" ? "Aksiya tavsifi" : language === "ru" ? "Описание акции" : "Promotion description"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === "uz" ? "Rasm" : language === "ru" ? "Изображение" : "Image"}</Label>
                  <Alert className="mt-2 mb-3">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {language === "uz"
                        ? "Format: JPG, PNG, WEBP | O'lcham: 1200x600px (tavsiya) | Maksimal hajm: 5MB"
                        : language === "ru"
                          ? "Формат: JPG, PNG, WEBP | Размер: 1200x600px (рекомендуется) | Макс. размер: 5MB"
                          : "Format: JPG, PNG, WEBP | Size: 1200x600px (recommended) | Max size: 5MB"}
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center gap-4">
                    {newPromotion.image && (
                      <div className="w-48 h-32 rounded-lg overflow-hidden border">
                        <img
                          src={newPromotion.image || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, "promotion")}
                        className="hidden"
                        id="promotion-image"
                      />
                      <Label htmlFor="promotion-image" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                          <Upload className="h-4 w-4" />
                          {language === "uz"
                            ? "Rasm yuklash"
                            : language === "ru"
                              ? "Загрузить изображение"
                              : "Upload Image"}
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="promo_active">{language === "uz" ? "Faol" : language === "ru" ? "Активно" : "Active"}</Label>
                  <Switch
                    id="promo_active"
                    checked={newPromotion.active}
                    onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, active: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClosePromotionDialog}>
                {language === "uz" ? "Bekor qilish" : language === "ru" ? "Отмена" : "Cancel"}
              </Button>
              <Button onClick={handleSavePromotion}>
                {editingPromotion 
                  ? (language === "uz" ? "Yangilash" : language === "ru" ? "Обновить" : "Update")
                  : (language === "uz" ? "Qo'shish" : language === "ru" ? "Добавить" : "Add")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="menu" className="flex flex-col items-center gap-1 py-2 px-1 text-[10px] sm:text-xs">
              <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{language === "uz" ? "Taomlar" : language === "ru" ? "Блюда" : "Dishes"}</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex flex-col items-center gap-1 py-2 px-1 text-[10px] sm:text-xs">
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{language === "uz" ? "Kategoriyalar" : language === "ru" ? "Категории" : "Categories"}</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex flex-col items-center gap-1 py-2 px-1 text-[10px] sm:text-xs">
              <Megaphone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{language === "uz" ? "Aksiyalar" : language === "ru" ? "Акции" : "Promotions"}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex flex-col items-center gap-1 py-2 px-1 text-[10px] sm:text-xs relative">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{language === "uz" ? "Izohlar" : language === "ru" ? "Отзывы" : "Reviews"}</span>
              {pendingReviews.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px]">
                  {pendingReviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {language === "uz"
                  ? "Taomlar boshqaruvi"
                  : language === "ru"
                    ? "Управление блюдами"
                    : "Dishes Management"}
              </h2>
              <Button 
                onClick={() => setIsAddingItem(true)} 
                variant="outline"
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {language === "uz" ? "Yangi Taom Qo'shish" : language === "ru" ? "Добавить новое блюдо" : "Add New Dish"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(menuItems) && menuItems.map((item) => (
                <Card key={item.id} className={`${!item.is_active ? 'opacity-50' : ''}`}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={language === "uz" ? item.name_uz : language === "ru" ? item.name_ru : item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available
                          ? language === "uz"
                            ? "Mavjud"
                            : language === "ru"
                              ? "Доступно"
                              : "Available"
                          : language === "uz"
                            ? "Mavjud emas"
                            : language === "ru"
                              ? "Недоступно"
                              : "Unavailable"}
                      </Badge>
                    </div>
                    {item.rating && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">{item.rating}</span>
                      </div>
                    )}
                    {item.prep_time && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                        {item.prep_time} {language === "uz" ? "daq" : language === "ru" ? "мин" : "min"}
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {language === "uz" ? item.name_uz : language === "ru" ? item.name_ru : item.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {language === "uz"
                        ? item.ingredients_uz
                        : language === "ru"
                          ? item.ingredients_ru
                          : item.ingredients}
                    </CardDescription>
                    <div className="text-lg font-bold text-primary mt-2">{formatPrice(item.price)}</div>
                </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {language === "uz" ? "Faol:" : language === "ru" ? "Активно:" : "Active:"}
                        </span>
                        <StatusSwitch
                          checked={item.is_active}
                          onCheckedChange={(checked) => handleToggleActive('menu', item.id, checked)}
                          variant="success"
                        />
                        <span className={`text-xs font-medium ${item.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {item.is_active 
                            ? (language === "uz" ? "Faol" : language === "ru" ? "Активно" : "Active")
                            : (language === "uz" ? "Faol emas" : language === "ru" ? "Неактивно" : "Inactive")
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                          <Edit className="h-3 w-3" />
                    </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                    </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
              ))}
        </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {language === "uz"
                  ? "Kategoriyalar boshqaruvi"
                  : language === "ru"
                    ? "Управление категориями"
                    : "Categories Management"}
              </h2>
              <Button 
                onClick={() => setIsAddingCategory(true)} 
                variant="outline" 
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {language === "uz" ? "Yangi Kategoriya Qo'shish" : language === "ru" ? "Добавить новую категорию" : "Add New Category"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(categories) && categories.map((category) => (
                <Card key={category.id} className={`${!category.is_active ? 'opacity-50' : ''}`}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-5xl mb-2">{category.icon}</div>
                        <h3 className="text-xl font-bold">
                          {language === "uz" ? category.name_uz : language === "ru" ? category.name_ru : category.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {language === "uz" ? "Faol:" : language === "ru" ? "Активно:" : "Active:"}
                        </span>
                        <StatusSwitch
                          checked={category.is_active}
                          onCheckedChange={(checked) => handleToggleActive('category', category.id, checked)}
                          variant="success"
                        />
                        <span className={`text-xs font-medium ${category.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {category.is_active 
                            ? (language === "uz" ? "Faol" : language === "ru" ? "Активно" : "Active")
                            : (language === "uz" ? "Faol emas" : language === "ru" ? "Неактивно" : "Inactive")
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promotions" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {language === "uz"
                  ? "Aksiyalar boshqaruvi"
                  : language === "ru"
                    ? "Управление акциями"
                    : "Promotions Management"}
              </h2>
              <Button 
                onClick={() => setIsAddingPromotion(true)} 
                variant="outline" 
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {language === "uz" ? "Yangi Aksiya Qo'shish" : language === "ru" ? "Добавить новую акцию" : "Add New Promotion"}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(promotions) && promotions.map((promotion) => (
                <Card key={promotion.id} className={`${!promotion.is_active ? 'opacity-50' : ''}`}>
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={promotion.image || "/placeholder.svg"}
                      alt={
                        language === "uz" ? promotion.title_uz : language === "ru" ? promotion.title_ru : promotion.title
                      }
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={promotion.active ? "default" : "secondary"}>
                        {promotion.active
                          ? language === "uz"
                            ? "Faol"
                            : language === "ru"
                              ? "Активно"
                              : "Active"
                          : language === "uz"
                            ? "Faol emas"
                            : language === "ru"
                              ? "Неактивно"
                              : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {language === "uz" ? promotion.title_uz : language === "ru" ? promotion.title_ru : promotion.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {language === "uz"
                        ? promotion.description_uz
                        : language === "ru"
                          ? promotion.description_ru
                          : promotion.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {language === "uz" ? "Faol:" : language === "ru" ? "Активно:" : "Active:"}
                        </span>
                        <StatusSwitch
                          checked={promotion.is_active}
                          onCheckedChange={(checked) => handleToggleActive('promotion', promotion.id, checked)}
                          variant="success"
                        />
                        <span className={`text-xs font-medium ${promotion.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {promotion.is_active 
                            ? (language === "uz" ? "Faol" : language === "ru" ? "Активно" : "Active")
                            : (language === "uz" ? "Faol emas" : language === "ru" ? "Неактивно" : "Inactive")
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditPromotion(promotion)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePromotion(promotion.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {language === "uz"
                  ? "Izohlar boshqaruvi"
                  : language === "ru"
                    ? "Управление отзывами"
                    : "Reviews Management"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {language === "uz"
                  ? "Foydalanuvchilar izohlarini ko'rib chiqing va tasdiqlang"
                  : language === "ru"
                    ? "Просмотрите и одобрите отзывы пользователей"
                    : "Review and approve user reviews"}
              </p>
            </div>

            {/* Pending Reviews */}
            {pendingReviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="secondary">{pendingReviews.length}</Badge>
                  {language === "uz"
                    ? "Tasdiqlanmagan izohlar"
                    : language === "ru"
                      ? "Ожидающие одобрения"
                      : "Pending Approval"}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingReviews.map((review) => (
                    <Card key={review.id} className="border-yellow-200 bg-yellow-50/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {review.name} {review.surname}
                            </CardTitle>
                            <CardDescription>{review.date}</CardDescription>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveReview(review.id)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {language === "uz" ? "Tasdiqlash" : language === "ru" ? "Одобрить" : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectReview(review.id)}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            {language === "uz" ? "Rad etish" : language === "ru" ? "Отклонить" : "Reject"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Reviews */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {language === "uz"
                  ? "Barcha izohlar"
                  : language === "ru"
                    ? "Все отзывы"
                    : "All Reviews"}
              </h3>
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {language === "uz"
                      ? "Hozircha izohlar yo'q"
                      : language === "ru"
                        ? "Пока нет отзывов"
                        : "No reviews yet"}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews
                    .map((review) => (
                      <Card key={review.id} className={review.deleted ? "border-red-200 bg-red-50/50" : review.approved ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {review.name} {review.surname}
                              </CardTitle>
                              <CardDescription className={`text-xs ${review.deleted ? "text-red-600" : review.approved ? "text-green-600" : "text-yellow-600"}`}>
                                {review.deleted 
                                  ? (language === "uz" ? "Rad etilgan" : language === "ru" ? "Отклонен" : "Rejected")
                                  : review.approved 
                                    ? (language === "uz" ? "Tasdiqlangan" : language === "ru" ? "Одобрен" : "Approved")
                                    : (language === "uz" ? "Kutilmoqda" : language === "ru" ? "Ожидает" : "Pending")
                                } - {review.date}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm leading-relaxed line-clamp-3 mb-4">{review.comment}</p>
                          <div className="flex gap-2">
                            {!review.approved && !review.deleted && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveReview(review.id)}
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  {language === "uz" ? "Tasdiqlash" : language === "ru" ? "Одобрить" : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectReview(review.id)}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  {language === "uz" ? "Rad etish" : language === "ru" ? "Отклонить" : "Reject"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="px-3"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {review.approved && !review.deleted && (
                              <>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectReview(review.id)}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  {language === "uz" ? "Rad etish" : language === "ru" ? "Отклонить" : "Reject"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="px-3"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {review.deleted && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveReview(review.id)}
                                  className="bg-green-600 hover:bg-green-700 flex-1"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  {language === "uz" ? "Qayta tasdiqlash" : language === "ru" ? "Повторно одобрить" : "Re-approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="px-3"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
          </Card>
                    ))}
                </div>
              )}

        </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Confirmation Modal */}
      {ConfirmationModal}
    </div>
  )
}
