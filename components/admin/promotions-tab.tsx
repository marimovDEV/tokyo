"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { formatPrice } from "@/lib/api"
import { useMenu } from "@/lib/menu-context"
import { useApiClient } from "@/hooks/use-api"
import { usePromotions, useAdminCategories, useMenuItems } from "@/hooks/use-api"
import type { Promotion } from "@/lib/types"
import { toast } from "sonner"

export function PromotionsTab() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useMenu()
  const { refetch: refetchPromotions, loading: promotionsLoading } = usePromotions()
  const { categories } = useAdminCategories()
  const { menuItems } = useMenuItems()
  const api = useApiClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    imageFile: null as File | null,
    discount_percentage: 0,
    discount_amount: 0,
    is_active: true,
    start_date: "",
    end_date: "",
    category: "none",
    linked_dish: "none",
    price: 0,
    ingredients: "",
  })

  // Language selection for multilingual fields
  const [currentLang, setCurrentLang] = useState<'uz' | 'ru' | 'en'>('uz')
  const [multilingualData, setMultilingualData] = useState({
    title_uz: "",
    title_ru: "",
    description_uz: "",
    description_ru: "",
    ingredients_uz: "",
    ingredients_ru: "",
  })

  // Refresh promotions data when component mounts
  useEffect(() => {
    // Force refresh with cache busting
    const refreshPromotions = async () => {
      try {
        await refetchPromotions()
      } catch (error) {
        console.error('Error refreshing promotions:', error)
      }
    }
    refreshPromotions()
  }, []) // Empty dependency array to run only once

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
        formDataToSend.append('title_uz', multilingualData.title_uz)
        formDataToSend.append('title_ru', multilingualData.title_ru)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('description_uz', multilingualData.description_uz)
        formDataToSend.append('description_ru', multilingualData.description_ru)
        formDataToSend.append('discount_percentage', (formData.discount_percentage || 0).toString())
        formDataToSend.append('discount_amount', (formData.discount_amount || 0).toString())
        formDataToSend.append('is_active', formData.is_active.toString())
        formDataToSend.append('start_date', formData.start_date)
        formDataToSend.append('end_date', formData.end_date)
        formDataToSend.append('price', (formData.price || 0).toString())
        
        // Convert comma-separated strings to JSON arrays
        const ingredientsArray = formData.ingredients ? formData.ingredients.split(',').map(item => item.trim()).filter(item => item) : []
        const ingredientsUzArray = multilingualData.ingredients_uz ? multilingualData.ingredients_uz.split(',').map(item => item.trim()).filter(item => item) : []
        const ingredientsRuArray = multilingualData.ingredients_ru ? multilingualData.ingredients_ru.split(',').map(item => item.trim()).filter(item => item) : []
        
        formDataToSend.append('ingredients', JSON.stringify(ingredientsArray))
        formDataToSend.append('ingredients_uz', JSON.stringify(ingredientsUzArray))
        formDataToSend.append('ingredients_ru', JSON.stringify(ingredientsRuArray))
        
        if (formData.category && formData.category !== 'none') formDataToSend.append('category', formData.category)
        if (formData.linked_dish && formData.linked_dish !== 'none') formDataToSend.append('linked_dish', formData.linked_dish)
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile)
      }

      if (editingPromotion) {
        const promotionId = parseInt(editingPromotion.id)
        const updatedPromotion = await api.patchFormData(`/promotions/${promotionId}/`, formDataToSend)
        // Don't use updatePromotion to avoid double updating, just refetch
        toast.success("Aksiya yangilandi")
      } else {
        const newPromotion = await api.postFormData('/promotions/', formDataToSend)
        // Don't use addPromotion to avoid double adding, just refetch
        toast.success("Aksiya qo'shildi")
      }
      
      await refetchPromotions() // Refetch to ensure data is updated
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    
    // Sana format'ini tuzatish - ISO format'dan datetime-local format'iga
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return ""
      try {
        const date = new Date(dateString)
        // Timezone offset'ni olib tashlash va YYYY-MM-DDTHH:MM format'iga o'tkazish
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      } catch {
        return ""
      }
    }
    
    setFormData({
      title: promotion.title,
      description: promotion.description,
      image: promotion.image,
      imageFile: null,
      discount_percentage: promotion.discount_percentage || 0,
      discount_amount: promotion.discount_amount || 0,
      is_active: promotion.is_active !== false,
      start_date: formatDateForInput(promotion.start_date || ""),
      end_date: formatDateForInput(promotion.end_date || ""),
      category: promotion.category?.toString() || "none",
      linked_dish: promotion.linked_dish?.toString() || "none",
      price: promotion.price || 0,
      ingredients: Array.isArray(promotion.ingredients) ? promotion.ingredients.join(", ") : "",
    })
    setMultilingualData({
      title_uz: promotion.title_uz || promotion.titleUz || "",
      title_ru: promotion.title_ru || promotion.titleRu || "",
      description_uz: promotion.description_uz || promotion.descriptionUz || "",
      description_ru: promotion.description_ru || promotion.descriptionRu || "",
      ingredients_uz: Array.isArray(promotion.ingredients_uz) ? promotion.ingredients_uz.join(", ") : "",
      ingredients_ru: Array.isArray(promotion.ingredients_ru) ? promotion.ingredients_ru.join(", ") : "",
    })
    setCurrentLang('uz')
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
        // Don't use deletePromotion to avoid double deleting, just refetch
        await refetchPromotions() // Wait for refetch to complete
        toast.success("Aksiya o'chirildi")
        setDeleteDialogOpen(false)
        setPromotionToDelete(null)
      } catch (error) {
        console.error('Error deleting promotion:', error)
        toast.error(`Xatolik yuz berdi: ${error.message || 'Noma\'lum xato'}`)
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
      description: "",
      image: "",
      imageFile: null,
      discount_percentage: 0,
      discount_amount: 0,
      is_active: true,
      start_date: "",
      end_date: "",
      category: "none",
      linked_dish: "none",
      price: 0,
      ingredients: "",
    })
    setMultilingualData({
      title_uz: "",
      title_ru: "",
      description_uz: "",
      description_ru: "",
      ingredients_uz: "",
      ingredients_ru: "",
    })
    setCurrentLang('uz')
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
              <DialogDescription className="text-white/60">
                {editingPromotion ? "Mavjud aksiyani o'zgartiring" : "Yangi aksiya yarating va barcha maydonlarni to'ldiring"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field with Language Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm font-medium">Sarlavha</Label>
                  <div className="flex gap-2">
                    {(['uz', 'ru', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          currentLang === lang
                            ? "bg-amber-500 text-white"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {lang === "uz" ? "UZ" : lang === "ru" ? "RU" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={currentLang === 'uz' ? multilingualData.title_uz : 
                         currentLang === 'ru' ? multilingualData.title_ru : formData.title}
                  onChange={(e) => {
                    if (currentLang === 'uz') {
                      setMultilingualData({ ...multilingualData, title_uz: e.target.value })
                    } else if (currentLang === 'ru') {
                      setMultilingualData({ ...multilingualData, title_ru: e.target.value })
                    } else {
                      setFormData({ ...formData, title: e.target.value })
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white text-sm"
                  placeholder={currentLang === 'uz' ? "O'zbekcha sarlavha" : 
                             currentLang === 'ru' ? "Русский заголовок" : "English title"}
                  required
                />
              </div>

              {/* Description Field with Language Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm font-medium">Tavsif</Label>
                  <div className="flex gap-2">
                    {(['uz', 'ru', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          currentLang === lang
                            ? "bg-amber-500 text-white"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {lang === "uz" ? "UZ" : lang === "ru" ? "RU" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={currentLang === 'uz' ? multilingualData.description_uz : 
                         currentLang === 'ru' ? multilingualData.description_ru : formData.description}
                  onChange={(e) => {
                    if (currentLang === 'uz') {
                      setMultilingualData({ ...multilingualData, description_uz: e.target.value })
                    } else if (currentLang === 'ru') {
                      setMultilingualData({ ...multilingualData, description_ru: e.target.value })
                    } else {
                      setFormData({ ...formData, description: e.target.value })
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                  placeholder={currentLang === 'uz' ? "O'zbekcha tavsif" : 
                             currentLang === 'ru' ? "Русское описание" : "English description"}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image" className="text-white text-sm font-medium">
                  Rasm
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-white/10 border-white/20 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                />
                {formData.image && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mt-2">
                    <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Discount Fields - Combined */}
              <div className="space-y-4">
                {/* Warning Rules */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">!</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-amber-400 font-semibold text-sm">Chegirma qoidalari:</h4>
                      <ul className="text-white/80 text-xs space-y-1">
                        <li>• <strong>Chegirma foizi</strong> va <strong>chegirma miqdori</strong>ni bir vaqtda ishlatmang</li>
                        <li>• Faqat bitta turda chegirma kiriting: yoki foiz (20%) yoki miqdor (5000 so'm)</li>
                        <li>• <strong>Aksiya narxi</strong> har doim kiritilishi kerak (yakuniy narx)</li>
                        <li>• Agar chegirma foizi = 20% va asl narx = 30000 so'm, aksiya narxi = 24000 so'm bo'ladi</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount_percentage" className="text-white text-sm font-medium">
                      Chegirma (%)
                    </Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage || ""}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: Number.parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="20"
                    />
                    <p className="text-white/60 text-xs mt-1">0-100% orasida kiriting</p>
                  </div>
                  <div>
                    <Label htmlFor="discount_amount" className="text-white text-sm font-medium">
                      Chegirma Miqdori (so'm)
                    </Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      value={formData.discount_amount || ""}
                      onChange={(e) => setFormData({ ...formData, discount_amount: Number.parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="5000"
                    />
                    <p className="text-white/60 text-xs mt-1">Belgilangan miqdordagi chegirma</p>
                  </div>
                </div>
              </div>

              {/* Price Field */}
              <div>
                <Label htmlFor="price" className="text-white text-sm font-medium">
                  Aksiya Narxi (so'm)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                  className="bg-white/10 border-white/20 text-white text-sm"
                  placeholder="50000"
                  required
                />
                <p className="text-white/60 text-xs mt-1">
                  <strong>Yakuniy narx</strong> - chegirma qo'llanganidan keyingi narx (majburiy)
                </p>
              </div>

              {/* Category and Linked Dish */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white text-sm font-medium">
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
                      <SelectItem value="none" className="text-white">Kategoriya yo'q</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                          {cat.name_uz || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="linked_dish" className="text-white text-sm font-medium">
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
                      <SelectItem value="none" className="text-white">Taom yo'q</SelectItem>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()} className="text-white">
                          {item.name_uz || item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ingredients Field with Language Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm font-medium">Tarkibi</Label>
                  <div className="flex gap-2">
                    {(['uz', 'ru', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          currentLang === lang
                            ? "bg-amber-500 text-white"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {lang === "uz" ? "UZ" : lang === "ru" ? "RU" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={currentLang === 'uz' ? multilingualData.ingredients_uz : 
                         currentLang === 'ru' ? multilingualData.ingredients_ru : formData.ingredients}
                  onChange={(e) => {
                    if (currentLang === 'uz') {
                      setMultilingualData({ ...multilingualData, ingredients_uz: e.target.value })
                    } else if (currentLang === 'ru') {
                      setMultilingualData({ ...multilingualData, ingredients_ru: e.target.value })
                    } else {
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                  }}
                  className="bg-white/10 border-white/20 text-white text-sm"
                  placeholder={currentLang === 'uz' ? "Mahsulot1, Mahsulot2, Mahsulot3" : 
                             currentLang === 'ru' ? "Ингредиент1, Ингредиент2, Ингредиент3" : 
                             "Ingredient1, Ingredient2, Ingredient3"}
                />
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-white text-sm font-medium">
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
                  <Label htmlFor="end_date" className="text-white text-sm font-medium">
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

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-white text-sm font-medium">
                  Ko'rinadi
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-lg font-semibold"
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
                src={promotion.image || "https://api.tokyokafe.uz/media/defaults/promo.jpg"}
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
                  <p>{formatPrice(promotion.discount_amount)} chegirma</p>
                )}
                {promotion.price > 0 && (
                  <p>Narx: {formatPrice(promotion.price)}</p>
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
