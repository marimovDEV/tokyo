export interface Category {
  id: string
  name: string
  name_uz: string
  name_ru: string
  image: string
  order: number
}

export interface MenuItem {
  id: string
  name: string
  name_uz: string
  name_ru: string
  description: string
  description_uz: string
  description_ru: string
  image: string
  price: number
  weight?: number // in grams
  ingredients: string[]
  ingredients_uz: string[]
  ingredients_ru: string[]
  rating: number
  prep_time: string // in minutes, can be range like "15-20"
  category: number // category ID from backend
  available: boolean
  is_active: boolean
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface Promotion {
  id: string
  title: string
  title_uz: string
  title_ru: string
  description: string
  description_uz: string
  description_ru: string
  image: string
  discount_percentage: number // percentage
  discount_amount: number // amount in so'm
  start_date: string
  end_date: string
  is_active: boolean
  category?: number
  category_name?: string
  category_name_uz?: string
  category_name_ru?: string
  linked_dish?: number
  price: number // aksiya narxi
  ingredients: string[]
  ingredients_uz: string[]
  ingredients_ru: string[]
}

export interface Feedback {
  id: string
  name: string
  phone: string
  message: string
  type: "suggestion" | "complaint"
  date: string
  read: boolean
}

export type Language = "uz" | "ru" | "en"
