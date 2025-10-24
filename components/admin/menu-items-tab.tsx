"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatPrice, formatWeight } from "@/lib/api"
import { useMenu } from "@/lib/menu-context"
import { useApiClient } from "@/hooks/use-api"
import { useMenuItems, useAdminCategories } from "@/hooks/use-api"
import type { MenuItem } from "@/lib/types"
import { toast } from "sonner"

export function MenuItemsTab() {
  const { categories, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu()
  const { menuItems, refetch: refetchMenuItems, loading: menuItemsLoading } = useMenuItems()
  const { categories: adminCategories } = useAdminCategories()
  const api = useApiClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    name_uz: "",
    name_ru: "",
    description: "",
    description_uz: "",
    description_ru: "",
    image: null as File | null,
    price: 0,
    weight: 0,
    ingredients: "",
    ingredients_uz: "",
    ingredients_ru: "",
    rating: 5,
    prep_time: "15", // String for range format like "15-20"
    order: 0, // Kategoriyadagi tartib raqami
    category: "",
    available: true,
    is_active: true,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log('Form submitted with data:', formData)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('name_uz', formData.name_uz)
      formDataToSend.append('name_ru', formData.name_ru)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('description_uz', formData.description_uz)
      formDataToSend.append('description_ru', formData.description_ru)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('weight', formData.weight > 0 ? formData.weight.toString() : '')
      // Convert comma-separated strings to JSON arrays
      const ingredientsArray = formData.ingredients ? formData.ingredients.split(',').map(item => item.trim()).filter(item => item) : []
      const ingredientsUzArray = formData.ingredients_uz ? formData.ingredients_uz.split(',').map(item => item.trim()).filter(item => item) : []
      const ingredientsRuArray = formData.ingredients_ru ? formData.ingredients_ru.split(',').map(item => item.trim()).filter(item => item) : []
      
      formDataToSend.append('ingredients', JSON.stringify(ingredientsArray))
      formDataToSend.append('ingredients_uz', JSON.stringify(ingredientsUzArray))
      formDataToSend.append('ingredients_ru', JSON.stringify(ingredientsRuArray))
      formDataToSend.append('rating', formData.rating.toString())
      formDataToSend.append('prep_time', formData.prep_time) // Already string
      formDataToSend.append('order', formData.order.toString())
      formDataToSend.append('category', formData.category.toString())
      formDataToSend.append('available', formData.available.toString())
      formDataToSend.append('is_active', formData.is_active.toString())
      
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      if (editingItem) {
        // Update existing item
        const itemId = parseInt(editingItem.id)
        console.log('Updating menu item with ID:', itemId)
        const updatedItem = await api.patchFormData(`/menu-items/${itemId}/`, formDataToSend)
        console.log('Updated item:', updatedItem)
        updateMenuItem(editingItem.id, updatedItem)
        refetchMenuItems() // Refetch to ensure data is updated
        toast.success("Taom yangilandi")
      } else {
        // Create new item
        console.log('Creating new menu item...')
        console.log('FormData contents:', Array.from(formDataToSend.entries()))
        const newItem = await api.postFormData('/menu-items/', formDataToSend)
        console.log('New menu item created:', newItem)
        addMenuItem(newItem)
        // Force refresh after creation
        setTimeout(() => {
          refetchMenuItems()
        }, 500)
        toast.success("Taom qo'shildi")
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving menu item:', error)
      console.error('Error details:', error.message)
      toast.error(`Xatolik yuz berdi: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name || "",
      name_uz: item.name_uz || "",
      name_ru: item.name_ru || "",
      description: item.description || "",
      description_uz: item.description_uz || "",
      description_ru: item.description_ru || "",
      image: null,
      price: item.price || 0,
      weight: item.weight || 0,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(", ") : (item.ingredients || ""),
      ingredients_uz: Array.isArray(item.ingredients_uz) ? item.ingredients_uz.join(", ") : (item.ingredients_uz || ""),
      ingredients_ru: Array.isArray(item.ingredients_ru) ? item.ingredients_ru.join(", ") : (item.ingredients_ru || ""),
      rating: item.rating || 5,
      prep_time: item.prep_time || "15", // String for range format
      order: item.order || 0,
      category: item.category ? item.category.toString() : "",
      available: item.available !== false,
      is_active: item.is_active !== false,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      setIsDeleting(true)
      try {
        // Ensure ID is treated as integer for backend
        const itemId = parseInt(itemToDelete.id)
        console.log('Deleting menu item with ID:', itemId)
        await api.delete(`/menu-items/${itemId}/`)
        deleteMenuItem(itemToDelete.id)
        // Force refresh after deletion
        setTimeout(() => {
          refetchMenuItems()
        }, 500)
        toast.success("Taom o'chirildi")
        setDeleteDialogOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Error deleting menu item:', error)
        toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      name_uz: "",
      name_ru: "",
      description: "",
      description_uz: "",
      description_ru: "",
      image: null,
      price: 0,
      weight: 0,
      ingredients: "",
      ingredients_uz: "",
      ingredients_ru: "",
      rating: 5,
      prep_time: "15", // String for range format
      order: 0,
      category: "",
      available: true,
      is_active: true,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Taomlar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Taom qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">{editingItem ? "Taomni tahrirlash" : "Yangi taom"}</DialogTitle>
              <DialogDescription className="text-white/60">
                {editingItem ? "Mavjud taomni o'zgartiring" : "Yangi taom yarating va barcha maydonlarni to'ldiring"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white text-sm">
                    Nomi (EN)
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_uz" className="text-white text-sm">
                    Nomi (UZ)
                  </Label>
                  <Input
                    id="name_uz"
                    value={formData.name_uz}
                    onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_ru" className="text-white text-sm">
                    Nomi (RU)
                  </Label>
                  <Input
                    id="name_ru"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <Label htmlFor="description_uz" className="text-white text-sm">
                    Tavsif (UZ)
                  </Label>
                  <Textarea
                    id="description_uz"
                    value={formData.description_uz}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description_ru" className="text-white text-sm">
                    Tavsif (RU)
                  </Label>
                  <Textarea
                    id="description_ru"
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white text-sm">
                    Kategoriya
                  </Label>
                  <Select
                    value={formData.category.toString()}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      {adminCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                          {cat.name_uz || cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              {formData.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image src={URL.createObjectURL(formData.image)} alt="Preview" fill className="object-cover" />
                </div>
              )}
              {editingItem && editingItem.image && !formData.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image src={editingItem.image} alt="Current" fill className="object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="price" className="text-white text-sm">
                    Narxi (so'm)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value);
                      // Only allow positive numbers and 0, prevent NaN
                      if (!isNaN(value) && value >= 0) {
                        setFormData({ ...formData, price: value });
                      } else if (e.target.value === '' || e.target.value === '0') {
                        setFormData({ ...formData, price: 0 });
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-white text-sm">
                    Og'irligi (g)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight === 0 ? '' : formData.weight}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value);
                      // Only allow positive numbers, prevent NaN
                      if (!isNaN(value) && value > 0) {
                        setFormData({ ...formData, weight: value });
                      } else if (e.target.value === '') {
                        setFormData({ ...formData, weight: 0 });
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rating" className="text-white text-sm">
                    Reyting
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value);
                      // Only allow numbers between 0 and 5, prevent NaN
                      if (!isNaN(value) && value >= 0 && value <= 5) {
                        setFormData({ ...formData, rating: value });
                      } else if (e.target.value === '' || e.target.value === '0') {
                        setFormData({ ...formData, rating: 0 });
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prep_time" className="text-white text-sm">
                    Tayyorlanish (min)
                  </Label>
                  <Input
                    id="prep_time"
                    type="text"
                    value={formData.prep_time}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow numbers, dash, and spaces for formats like "15-20", "15 - 20", "15 min"
                      const isValid = /^[\d\s\-a-zA-Z]*$/.test(value);
                      
                      if (isValid) {
                        setFormData({ ...formData, prep_time: value });
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="15-20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order" className="text-white text-sm">
                    Tartib raqami
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="0 (avtomatik)"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Agar kiritilmasa, avtomatik ravishda oxirgi o'rindan keyin qo'shiladi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ingredients" className="text-white text-sm">
                    Tarkibi (EN, vergul bilan)
                  </Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    placeholder="Ingredient 1, Ingredient 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ingredients_uz" className="text-white text-sm">
                    Tarkibi (UZ, vergul bilan)
                  </Label>
                  <Textarea
                    id="ingredients_uz"
                    value={formData.ingredients_uz}
                    onChange={(e) => setFormData({ ...formData, ingredients_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    placeholder="Mahsulot 1, Mahsulot 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ingredients_ru" className="text-white text-sm">
                    Tarkibi (RU, vergul bilan)
                  </Label>
                  <Textarea
                    id="ingredients_ru"
                    value={formData.ingredients_ru}
                    onChange={(e) => setFormData({ ...formData, ingredients_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    placeholder="Ингредиент 1, Ингредиент 2"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                  <Label htmlFor="available" className="text-white text-sm">
                    Mavjud
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="text-white text-sm">
                    Faol
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingItem ? "Yangilanmoqda..." : "Qo'shilmoqda..."}
                  </>
                ) : (
                  editingItem ? "Yangilash" : "Qo'shish"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {menuItemsLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="ml-2 text-white">Yuklanmoqda...</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/60">Hozircha taomlar yo'q</p>
          </div>
        ) : (
          menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl"
          >
            <div className="relative h-32">
              <Image src={item.image || "/placeholder.svg"} alt={item.name_uz || item.name} fill className="object-cover" />
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{item.name_uz || item.name}</h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    {formatPrice(item.price || 0)} • {formatWeight(item.weight || 0)}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-lg font-bold">
                Taomni o'chirish
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-white/70">
              <strong>"{itemToDelete?.name_uz || itemToDelete?.name}"</strong> taomini o'chirishni xohlaysizmi?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                ⚠️ Bu amalni qaytarib bo'lmaydi!
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  O'chirilmoqda...
                </>
              ) : (
                "O'chirish"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
