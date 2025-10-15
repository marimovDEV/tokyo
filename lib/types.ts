export interface Category {
  id: string
  name: string
  nameUz: string
  nameRu: string
  image: string
  order: number
}

export interface MenuItem {
  id: string
  name: string
  nameUz: string
  nameRu: string
  description: string
  descriptionUz: string
  descriptionRu: string
  image: string
  price: number
  weight: number // in grams
  ingredients: string[]
  ingredientsUz: string[]
  ingredientsRu: string[]
  rating: number
  prepTime: number // in minutes
  categoryId: string
  available: boolean
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
  discount: number // percentage
  active: boolean
  startDate: string
  endDate: string
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
