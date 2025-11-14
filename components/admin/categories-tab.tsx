"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Plus, Pencil, Trash2, AlertTriangle, Loader2, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMenu } from "@/lib/menu-context"
import { useApiClient } from "@/hooks/use-api"
import { useAdminCategories } from "@/hooks/use-api"
import type { Category } from "@/lib/types"
import { toast } from "sonner"

export function CategoriesTab() {
  const { categories, menuItems, addCategory, updateCategory, deleteCategory } = useMenu()
  const { refetch: refetchCategories, loading: categoriesLoading } = useAdminCategories()
  const api = useApiClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "order" | "products">("order")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const { menuItems } = useMenu()
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
        // Force refresh to ensure UI updates immediately
        await refetchCategories() // Refetch to ensure data is updated
        // Single additional refresh for safety
        setTimeout(() => refetchCategories(), 200)
        // Extra refresh to ensure order numbers are updated
        setTimeout(() => refetchCategories(), 500)
        // Additional refreshes for order changes
        setTimeout(() => refetchCategories(), 1000)
        setTimeout(() => refetchCategories(), 1500)
        // Extra refreshes to clear any remaining cache
        setTimeout(() => refetchCategories(), 2000)
        setTimeout(() => refetchCategories(), 3000)
        toast.success("Kategoriya yangilandi")
      } else {
        // Create new category
        const newCategory = await api.post('/categories/', categoryData)
        // Force refresh to ensure UI updates immediately
        await refetchCategories() // Refetch to ensure data is updated
        // Single additional refresh for safety
        setTimeout(() => refetchCategories(), 200)
        // Extra refresh to ensure order numbers are updated
        setTimeout(() => refetchCategories(), 500)
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

  // Filtered and sorted categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = [...categories]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((cat) => {
        return (
          cat.name?.toLowerCase().includes(query) ||
          cat.name_uz?.toLowerCase().includes(query) ||
          cat.name_ru?.toLowerCase().includes(query)
        )
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "name":
          const nameA = (a.name_uz || a.name || "").toLowerCase()
          const nameB = (b.name_uz || b.name || "").toLowerCase()
          comparison = nameA.localeCompare(nameB)
          break
        case "order":
          comparison = (a.order || 0) - (b.order || 0)
          break
        case "products":
          const catAId = typeof a.id === 'number' ? a.id : parseInt(String(a.id))
          const catBId = typeof b.id === 'number' ? b.id : parseInt(String(b.id))
          const countA = menuItems?.filter((item) => {
            const itemCategoryId = typeof item.category === 'number' ? item.category : parseInt(String(item.category))
            return itemCategoryId === catAId
          }).length || 0
          const countB = menuItems?.filter((item) => {
            const itemCategoryId = typeof item.category === 'number' ? item.category : parseInt(String(item.category))
            return itemCategoryId === catBId
          }).length || 0
          comparison = countA - countB
          break
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [categories, searchQuery, sortBy, sortOrder, menuItems])

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
                    min="1"
                    max={editingCategory ? categories.length : categories.length + 1}
                    value={formData.order}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 0;
                      const maxValue = editingCategory ? categories.length : categories.length + 1;
                      if (value > maxValue) {
                        setFormData({ ...formData, order: maxValue });
                      } else if (value < 1) {
                        setFormData({ ...formData, order: 1 });
                      } else {
                        setFormData({ ...formData, order: value });
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder={`1-${editingCategory ? categories.length : categories.length + 1}`}
                  />
                  <p className="text-xs text-white/60 mt-1">
                    {editingCategory 
                      ? `1 dan ${categories.length} gacha raqam kiriting. Masalan: ${formData.order === 1 ? "birinchi o'rinda" : formData.order === categories.length ? "oxirgi o'rinda" : `${formData.order} o'rinda`}`
                      : `1 dan ${categories.length + 1} gacha raqam kiriting (yangi kategoriya uchun)`
                    }
                  </p>
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

      {/* Search and Sort Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <Input
            placeholder="Kategoriya qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-white/60" />
            <Select value={sortBy} onValueChange={(value: "name" | "order" | "products") => setSortBy(value)}>
              <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Tartiblash" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                <SelectItem value="order" className="text-white">Tartib</SelectItem>
                <SelectItem value="name" className="text-white">Nomi</SelectItem>
                <SelectItem value="products" className="text-white">Mahsulotlar soni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </Button>

          {/* Results Count */}
          <div className="ml-auto flex items-center text-white/60 text-sm">
            {filteredAndSortedCategories.length} ta kategoriya
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categoriesLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">Yuklanmoqda...</span>
          </div>
        ) : filteredAndSortedCategories.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-white/60">
              {searchQuery 
                ? "Qidiruv natijasi topilmadi" 
                : "Hozircha kategoriyalar yo'q"}
            </p>
          </div>
        ) : (
          filteredAndSortedCategories.map((category) => (
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
                    Tartib: {category.order || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Mahsulotlar: {(() => {
                      if (!menuItems || !Array.isArray(menuItems)) return 0
                      const categoryId = typeof category.id === 'number' ? category.id : parseInt(String(category.id))
                      return menuItems.filter((item) => {
                        if (!item || !item.category) return false
                        const itemCategoryId = typeof item.category === 'number' ? item.category : parseInt(String(item.category))
                        return itemCategoryId === categoryId
                      }).length
                    })()}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full h-7 sm:h-8 px-2 sm:px-3"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline text-xs">Tahrirlash</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(category)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-7 sm:h-8 px-2 sm:px-3"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline text-xs">O'chirish</span>
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
