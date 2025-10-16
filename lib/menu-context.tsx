"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Category, MenuItem, Promotion } from "./types"
import { useCategories, useMenuItems, usePromotions } from "@/hooks/use-api"

interface MenuContextType {
  categories: Category[]
  menuItems: MenuItem[]
  promotions: Promotion[]
  loading: boolean
  error: Error | null
  addCategory: (category: Category) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addMenuItem: (item: MenuItem) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  addPromotion: (promotion: Promotion) => void
  updatePromotion: (id: string, promotion: Partial<Promotion>) => void
  deletePromotion: (id: string) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

// Sample data
const sampleCategories: Category[] = [
  {
    id: "1",
    name: "Sushi",
    nameUz: "Sushi",
    nameRu: "Суши",
    image: "/assorted-sushi-platter.png",
    order: 1,
  },
  {
    id: "2",
    name: "Ramen",
    nameUz: "Ramen",
    nameRu: "Рамен",
    image: "/steaming-bowl-of-ramen.png",
    order: 2,
  },
  {
    id: "3",
    name: "Tempura",
    nameUz: "Tempura",
    nameRu: "Темпура",
    image: "/crispy-tempura.png",
    order: 3,
  },
]

const sampleMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "California Roll",
    nameUz: "Kaliforniya Roll",
    nameRu: "Калифорния Ролл",
    description: "Classic sushi roll with crab, avocado, and cucumber",
    descriptionUz: "Klassik sushi roll qisqichbaqa, avokado va bodring bilan",
    descriptionRu: "Классический суши-ролл с крабом, авокадо и огурцом",
    image: "/california-roll.png",
    price: 45000,
    weight: 250,
    ingredients: ["Crab", "Avocado", "Cucumber", "Rice", "Nori"],
    ingredientsUz: ["Qisqichbaqa", "Avokado", "Bodring", "Guruch", "Nori"],
    ingredientsRu: ["Краб", "Авокадо", "Огурец", "Рис", "Нори"],
    rating: 4.8,
    prepTime: 15,
    categoryId: "1",
    available: true,
  },
  {
    id: "2",
    name: "Spicy Tuna Roll",
    nameUz: "Achchiq Tuna Roll",
    nameRu: "Острый ролл с тунцом",
    description: "Fresh tuna with spicy mayo and cucumber",
    descriptionUz: "Yangi tuna achchiq mayonez va bodring bilan",
    descriptionRu: "Свежий тунец с острым майонезом и огурцом",
    image: "/spicy-tuna-roll.png",
    price: 55000,
    weight: 280,
    ingredients: ["Tuna", "Spicy Mayo", "Cucumber", "Rice", "Nori"],
    ingredientsUz: ["Tuna", "Achchiq mayonez", "Bodring", "Guruch", "Nori"],
    ingredientsRu: ["Тунец", "Острый майонез", "Огурец", "Рис", "Нори"],
    rating: 4.9,
    prepTime: 15,
    categoryId: "1",
    available: true,
  },
  {
    id: "3",
    name: "Tonkotsu Ramen",
    nameUz: "Tonkotsu Ramen",
    nameRu: "Тонкоцу Рамен",
    description: "Rich pork bone broth with noodles and toppings",
    descriptionUz: "Boy cho'chqa suyagi sho'rva noodles va qo'shimchalar bilan",
    descriptionRu: "Насыщенный бульон из свиных костей с лапшой и топпингами",
    image: "/tonkotsu-ramen.png",
    price: 65000,
    weight: 450,
    ingredients: ["Pork Broth", "Noodles", "Pork Belly", "Egg", "Green Onion"],
    ingredientsUz: ["Cho'chqa sho'rvasi", "Noodles", "Cho'chqa go'shti", "Tuxum", "Yashil piyoz"],
    ingredientsRu: ["Свиной бульон", "Лапша", "Свиная грудинка", "Яйцо", "Зеленый лук"],
    rating: 4.7,
    prepTime: 25,
    categoryId: "2",
    available: true,
  },
]

const samplePromotions: Promotion[] = [
  {
    id: "1",
    title: "Happy Hour Special",
    titleUz: "Happy Hour Maxsus",
    titleRu: "Счастливые часы",
    description: "20% off all sushi rolls from 2-5 PM",
    descriptionUz: "Barcha sushi rollarga 14:00-17:00 oralig'ida 20% chegirma",
    descriptionRu: "Скидка 20% на все суши-роллы с 14:00 до 17:00",
    image: "/sushi-promotion.jpg",
    discount: 20,
    active: true,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
]

export function MenuProvider({ children }: { children: React.ReactNode }) {
  // API dan ma'lumot olish
  const { categories: apiCategories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories()
  const { menuItems: apiMenuItems, loading: menuItemsLoading, error: menuItemsError, refetch: refetchMenuItems } = useMenuItems()
  const { promotions: apiPromotions, loading: promotionsLoading, error: promotionsError, refetch: refetchPromotions } = usePromotions()

  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])

  const loading = categoriesLoading || menuItemsLoading || promotionsLoading
  const error = categoriesError || menuItemsError || promotionsError

  // API dan kelgan ma'lumotlarni saqlash
  useEffect(() => {
    console.log('API Categories:', apiCategories)
    if (apiCategories && Array.isArray(apiCategories)) {
      console.log('Setting categories from API:', apiCategories)
      setCategories(apiCategories as any)
    } else if (!categoriesLoading && apiCategories === null) {
      console.log('No categories from API, using empty array')
      setCategories([])
    }
  }, [apiCategories, categoriesLoading])

  useEffect(() => {
    if (apiMenuItems && Array.isArray(apiMenuItems)) {
      setMenuItems(apiMenuItems as any)
    } else if (!menuItemsLoading && apiMenuItems === null) {
      setMenuItems([])
    }
  }, [apiMenuItems, menuItemsLoading])

  useEffect(() => {
    if (apiPromotions && Array.isArray(apiPromotions)) {
      setPromotions(apiPromotions as any)
    } else if (!promotionsLoading && apiPromotions === null) {
      setPromotions([])
    }
  }, [apiPromotions, promotionsLoading])

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category])
    // Refetch from API to ensure consistency
    refetchCategories()
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)))
    // Refetch from API to ensure consistency
    refetchCategories()
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
    // Refetch from API to ensure consistency
    refetchCategories()
  }

  const addMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [...prev, item])
    // Refetch from API to ensure consistency
    refetchMenuItems()
  }

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    // Refetch from API to ensure consistency
    refetchMenuItems()
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
    // Refetch from API to ensure consistency
    refetchMenuItems()
  }

  const addPromotion = (promotion: Promotion) => {
    setPromotions((prev) => [...prev, promotion])
    // Refetch from API to ensure consistency
    refetchPromotions()
  }

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    setPromotions((prev) => prev.map((promo) => (promo.id === id ? { ...promo, ...updates } : promo)))
    // Refetch from API to ensure consistency
    refetchPromotions()
  }

  const deletePromotion = (id: string) => {
    setPromotions((prev) => prev.filter((promo) => promo.id !== id))
    // Refetch from API to ensure consistency
    refetchPromotions()
  }

  return (
    <MenuContext.Provider
      value={{
        categories,
        menuItems,
        promotions,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addPromotion,
        updatePromotion,
        deletePromotion,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
