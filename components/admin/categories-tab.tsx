"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMenu } from "@/lib/menu-context"
import type { Category } from "@/lib/types"
import { toast } from "sonner"
import Image from "next/image"

export function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useMenu()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameUz: "",
    nameRu: "",
    image: "",
    order: 0,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCategory) {
      updateCategory(editingCategory.id, formData)
      toast.success("Kategoriya yangilandi")
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
      }
      addCategory(newCategory)
      toast.success("Kategoriya qo'shildi")
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameUz: category.nameUz,
      nameRu: category.nameRu,
      image: category.image,
      order: category.order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Kategoriyani o'chirishni xohlaysizmi?")) {
      deleteCategory(id)
      toast.success("Kategoriya o'chirildi")
    }
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      nameUz: "",
      nameRu: "",
      image: "",
      order: 0,
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
                  <Label htmlFor="nameUz" className="text-white text-sm">
                    Nomi (UZ)
                  </Label>
                  <Input
                    id="nameUz"
                    value={formData.nameUz}
                    onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameRu" className="text-white text-sm">
                    Nomi (RU)
                  </Label>
                  <Input
                    id="nameRu"
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image" className="text-white text-sm">
                  Rasm
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                    />
                  </div>
                  {formData.image && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                {editingCategory ? "Yangilash" : "Qo'shish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <div
              key={category.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/20 shadow-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{category.nameUz}</h3>
                  <p className="text-xs sm:text-sm text-white/60">Tartib: {category.order}</p>
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
                    onClick={() => handleDelete(category.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
