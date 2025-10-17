"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useMenu } from "@/lib/menu-context"
import { useApiClient } from "@/hooks/use-api"
import { usePromotions, useCategories, useMenuItems } from "@/hooks/use-api"
import type { Promotion } from "@/lib/types"
import { toast } from "sonner"

export function PromotionsTab() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useMenu()
  const { refetch: refetchPromotions, loading: promotionsLoading } = usePromotions()
  const { categories } = useCategories()
  const { menuItems } = useMenuItems()
  const api = useApiClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    title_uz: "",
    title_ru: "",
    description: "",
    description_uz: "",
    description_ru: "",
    image: "",
    imageFile: null as File | null,
    discount_percentage: 0,
    discount_amount: 0,
    is_active: true,
    start_date: "",
    end_date: "",
    category: "",
    linked_dish: "",
    price: 0,
    ingredients: "",
    ingredients_uz: "",
    ingredients_ru: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string, imageFile: file })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Create FormData for image upload
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title)
        formDataToSend.append('title_uz', formData.title_uz)
        formDataToSend.append('title_ru', formData.title_ru)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('description_uz', formData.description_uz)
        formDataToSend.append('description_ru', formData.description_ru)
        formDataToSend.append('discount_percentage', formData.discount_percentage.toString())
        formDataToSend.append('discount_amount', formData.discount_amount.toString())
        formDataToSend.append('is_active', formData.is_active.toString())
        formDataToSend.append('start_date', formData.start_date)
        formDataToSend.append('end_date', formData.end_date)
        formDataToSend.append('price', formData.price.toString())
        
        // Convert comma-separated strings to JSON arrays
        const ingredientsArray = formData.ingredients ? formData.ingredients.split(',').map(item => item.trim()).filter(item => item) : []
        const ingredientsUzArray = formData.ingredients_uz ? formData.ingredients_uz.split(',').map(item => item.trim()).filter(item => item) : []
        const ingredientsRuArray = formData.ingredients_ru ? formData.ingredients_ru.split(',').map(item => item.trim()).filter(item => item) : []
        
        formDataToSend.append('ingredients', JSON.stringify(ingredientsArray))
        formDataToSend.append('ingredients_uz', JSON.stringify(ingredientsUzArray))
        formDataToSend.append('ingredients_ru', JSON.stringify(ingredientsRuArray))
        
        if (formData.category) formDataToSend.append('category', formData.category)
        if (formData.linked_dish) formDataToSend.append('linked_dish', formData.linked_dish)
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile)
      }

      if (editingPromotion) {
        const promotionId = parseInt(editingPromotion.id)
        const updatedPromotion = await api.patchFormData(`/promotions/${promotionId}/`, formDataToSend)
        updatePromotion(editingPromotion.id, updatedPromotion)
        toast.success("Aksiya yangilandi")
      } else {
        const newPromotion = await api.postFormData('/promotions/', formDataToSend)
        addPromotion(newPromotion)
        toast.success("Aksiya qo'shildi")
      }
      
      refetchPromotions() // Refetch to ensure data is updated
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      title_uz: promotion.title_uz || promotion.titleUz || "",
      title_ru: promotion.title_ru || promotion.titleRu || "",
      description: promotion.description,
      description_uz: promotion.description_uz || promotion.descriptionUz || "",
      description_ru: promotion.description_ru || promotion.descriptionRu || "",
      image: promotion.image,
      imageFile: null,
      discount_percentage: promotion.discount_percentage || 0,
      discount_amount: promotion.discount_amount || 0,
      is_active: promotion.is_active !== false,
      start_date: promotion.start_date || "",
      end_date: promotion.end_date || "",
      category: promotion.category?.toString() || "",
      linked_dish: promotion.linked_dish?.toString() || "",
      price: promotion.price || 0,
      ingredients: Array.isArray(promotion.ingredients) ? promotion.ingredients.join(", ") : "",
      ingredients_uz: Array.isArray(promotion.ingredients_uz) ? promotion.ingredients_uz.join(", ") : "",
      ingredients_ru: Array.isArray(promotion.ingredients_ru) ? promotion.ingredients_ru.join(", ") : "",
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete(promotion)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (promotionToDelete) {
      try {
        const promotionId = parseInt(promotionToDelete.id)
        await api.delete(`/promotions/${promotionId}/`)
        deletePromotion(promotionToDelete.id)
        refetchPromotions() // Refetch to ensure data is updated
        toast.success("Aksiya o'chirildi")
        setDeleteDialogOpen(false)
        setPromotionToDelete(null)
      } catch (error) {
        console.error('Error deleting promotion:', error)
        toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPromotionToDelete(null)
  }

  const resetForm = () => {
    setEditingPromotion(null)
    setFormData({
      title: "",
      title_uz: "",
      title_ru: "",
      description: "",
      description_uz: "",
      description_ru: "",
      image: "",
      imageFile: null,
      discount_percentage: 0,
      discount_amount: 0,
      is_active: true,
      start_date: "",
      end_date: "",
      category: "",
      linked_dish: "",
      price: 0,
      ingredients: "",
      ingredients_uz: "",
      ingredients_ru: "",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Aksiyalar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Aksiya qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPromotion ? "Aksiyani tahrirlash" : "Yangi aksiya"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title" className="text-white text-sm">
                    Sarlavha (EN)
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="titleUz" className="text-white text-sm">
                    Sarlavha (UZ)
                  </Label>
                  <Input
                    id="titleUz"
                    value={formData.titleUz}
                    onChange={(e) => setFormData({ ...formData, titleUz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="titleRu" className="text-white text-sm">
                    Sarlavha (RU)
                  </Label>
                  <Input
                    id="titleRu"
                    value={formData.titleRu}
                    onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="description" className="text-white text-sm">
                    Tavsif (EN)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionUz" className="text-white text-sm">
                    Tavsif (UZ)
                  </Label>
                  <Textarea
                    id="descriptionUz"
                    value={formData.descriptionUz}
                    onChange={(e) => setFormData({ ...formData, descriptionUz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionRu" className="text-white text-sm">
                    Tavsif (RU)
                  </Label>
                  <Textarea
                    id="descriptionRu"
                    value={formData.descriptionRu}
                    onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image" className="text-white text-sm">
                    Rasm
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="bg-white/10 border-white/20 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_percentage" className="text-white text-sm">
                    Chegirma (%)
                  </Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_amount" className="text-white text-sm">
                    Chegirma Miqdori (so'm)
                  </Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    min="0"
                    value={formData.discount_amount}
                    onChange={(e) => setFormData({ ...formData, discount_amount: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="5000"
                  />
                </div>
              </div>

              {formData.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-white text-sm">
                    Boshlanish sanasi
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-white text-sm">
                    Tugash sanasi
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-white text-sm">
                  Ko'rinadi
                </Label>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-white text-sm">
                    Boshlanish Sanasi
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-white text-sm">
                    Tugash Sanasi
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
              </div>

              {/* Price Field */}
              <div>
                <Label htmlFor="price" className="text-white text-sm">
                  Aksiya Narxi (so'm)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white text-sm"
                  placeholder="50000"
                  required
                />
              </div>

              {/* Category and Linked Dish */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white text-sm">
                    Kategoriya
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="" className="text-white">Kategoriya yo'q</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                          {cat.name_uz || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="linked_dish" className="text-white text-sm">
                    Bog'langan Taom
                  </Label>
                  <Select
                    value={formData.linked_dish}
                    onValueChange={(value) => setFormData({ ...formData, linked_dish: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Taomni tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      <SelectItem value="" className="text-white">Taom yo'q</SelectItem>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()} className="text-white">
                          {item.name_uz || item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredients Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Tarkibi</h3>
                
                <div>
                  <Label htmlFor="ingredients" className="text-white text-sm">
                    Tarkibi (EN)
                  </Label>
                  <Input
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Ingredient1, Ingredient2, Ingredient3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ingredients_uz" className="text-white text-sm">
                    Tarkibi (UZ)
                  </Label>
                  <Input
                    id="ingredients_uz"
                    value={formData.ingredients_uz}
                    onChange={(e) => setFormData({ ...formData, ingredients_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Mahsulot1, Mahsulot2, Mahsulot3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ingredients_ru" className="text-white text-sm">
                    Tarkibi (RU)
                  </Label>
                  <Input
                    id="ingredients_ru"
                    value={formData.ingredients_ru}
                    onChange={(e) => setFormData({ ...formData, ingredients_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Ингредиент1, Ингредиент2, Ингредиент3"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                {editingPromotion ? "Yangilash" : "Qo'shish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotionsLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">Yuklanmoqda...</span>
          </div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/60">Hozircha aksiyalar yo'q</p>
          </div>
        ) : (
          promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl"
          >
            <div className="relative h-40">
              <Image
                src={promotion.image || "/placeholder.svg"}
                alt={promotion.titleUz}
                fill
                className="object-cover"
              />
              {promotion.active && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Faol
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{promotion.titleUz}</h3>
                  <p className="text-sm text-white/60 mb-2">{promotion.descriptionUz}</p>
              <div className="text-amber-400 font-bold text-lg">
                {promotion.discount_percentage > 0 && (
                  <p>{promotion.discount_percentage}% chegirma</p>
                )}
                {promotion.discount_percentage === 0 && promotion.discount_amount > 0 && (
                  <p>{promotion.discount_amount.toLocaleString()} so'm chegirma</p>
                )}
                {promotion.price > 0 && (
                  <p>Narx: {promotion.price.toLocaleString()} so'm</p>
                )}
              </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(promotion)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(promotion)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg">Aksiyani o'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Siz haqiqatan ham <strong>"{promotionToDelete?.titleUz}"</strong> aksiyasini o'chirishni xohlaysizmi?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                ⚠️ Bu amalni qaytarib bo'lmaydi!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
            >
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
