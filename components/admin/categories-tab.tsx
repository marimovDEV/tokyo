"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMenu } from "@/lib/menu-context"
import { useApiClient } from "@/hooks/use-api"
import { useAdminCategories } from "@/hooks/use-api"
import type { Category } from "@/lib/types"
import { toast } from "sonner"

export function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useMenu()
  const { refetch: refetchCategories, loading: categoriesLoading } = useAdminCategories()
  const api = useApiClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    name_uz: "",
    name_ru: "",
    is_active: true,
    order: 0,
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const categoryData = {
        name: formData.name,
        name_uz: formData.name_uz,
        name_ru: formData.name_ru,
        is_active: formData.is_active,
        order: formData.order || (categories.length + 1),
      }

      if (editingCategory) {
        // Update existing category
        const categoryId = parseInt(editingCategory.id)
        const updatedCategory = await api.patch(`/categories/${categoryId}/`, categoryData)
        // Don't use updateCategory to avoid double updating, just refetch
        await refetchCategories() // Refetch to ensure data is updated
        toast.success("Kategoriya yangilandi")
      } else {
        // Create new category
        const newCategory = await api.post('/categories/', categoryData)
        // Don't use addCategory to avoid double adding, just refetch
        await refetchCategories() // Refetch to ensure data is updated
        toast.success("Kategoriya qo'shildi")
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || "",
      name_uz: category.name_uz || "",
      name_ru: category.name_ru || "",
      is_active: category.is_active !== false,
      order: category.order || 0,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      setIsDeleting(true)
      setDeletingCategoryId(categoryToDelete.id)
      try {
        // Ensure ID is treated as integer for backend
        const categoryId = parseInt(categoryToDelete.id)
        console.log('Deleting category with ID:', categoryId, 'Original ID:', categoryToDelete.id)
        
        // Check if category exists in current categories
        const currentCategory = categories.find(cat => cat.id === categoryToDelete.id)
        if (!currentCategory) {
          console.warn('Category not found in current categories, closing dialog...')
          toast.error("Bu kategoriya allaqachon o'chirilgan yoki mavjud emas.")
          setDeleteDialogOpen(false)
          setCategoryToDelete(null)
          setDeletingCategoryId(null)
          // Refresh data without trying to delete
          await refetchCategories()
          return
        }
        
        await api.delete(`/categories/${categoryId}/`)
        console.log('Delete successful, refreshing categories...')
        
        // Close dialog first for better UX
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
        
        // Then refetch data
        await refetchCategories() // Refetch to ensure data is updated
        console.log('Categories refreshed after delete')
        
        // Force additional refresh to ensure UI updates
        setTimeout(() => {
          refetchCategories()
        }, 100)
        
        toast.success("Kategoriya o'chirildi")
      } catch (error) {
        console.error('Error deleting category:', error)
        // If it's a 404 error, it means the category was already deleted
        if (error.message && error.message.includes('404')) {
          console.log('Category already deleted (404), refreshing data...')
          toast.success("Kategoriya o'chirildi")
          await refetchCategories()
        } else {
          toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
        }
      } finally {
        setIsDeleting(false)
        setDeletingCategoryId(null)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      name_uz: "",
      name_ru: "",
      is_active: true,
      order: categories.length + 1,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Kategoriyalar</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Kategoriya qo'shish</span>
              <span className="sm:hidden">Qo'shish</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {editingCategory ? "Mavjud kategoriyani o'zgartiring" : "Yangi kategoriya yarating va barcha maydonlarni to'ldiring"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white text-sm">
                    Nomi (EN)
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
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
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ru" className="text-white text-sm">
                    Nomi (RU)
                  </Label>
                  <Input
                    id="name_ru"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
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
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Avtomatik"
                  />
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
                    {editingCategory ? "Yangilanmoqda..." : "Qo'shilmoqda..."}
                  </>
                ) : (
                  editingCategory ? "Yangilash" : "Qo'shish"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categoriesLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">Yuklanmoqda...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/60">Hozircha kategoriyalar yo'q</p>
          </div>
        ) : (
          categories
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((category) => (
            <div
              key={category.id}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl transition-opacity ${
                deletingCategoryId === category.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{category.name_uz || category.name}</h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    {category.is_active ? "Faol" : "Noaktiv"}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(category)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
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
                Kategoriyani o'chirish
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-white/70">
              <strong>"{categoryToDelete?.name_uz || categoryToDelete?.name}"</strong> kategoriyasini o'chirishni xohlaysizmi?
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
