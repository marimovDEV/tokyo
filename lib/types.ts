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
  titleUz: string
  titleRu: string
  description: string
  descriptionUz: string
  descriptionRu: string
  image: string
  discount_percentage: number // percentage
  discount_amount: number // amount in so'm
  start_date: string
  end_date: string
  active: boolean
  is_active: boolean
  link?: string
  category?: number
  linked_dish?: number
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
