"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMenu } from "@/lib/menu-context"
import type { MenuItem } from "@/lib/types"
import { toast } from "sonner"

export function MenuItemsTab() {
  const { categories, menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameUz: "",
    nameRu: "",
    description: "",
    descriptionUz: "",
    descriptionRu: "",
    image: "",
    price: 0,
    weight: 0,
    ingredients: "",
    ingredientsUz: "",
    ingredientsRu: "",
    rating: 5,
    prepTime: 15,
    categoryId: "",
    available: true,
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

    const itemData = {
      ...formData,
      ingredients: formData.ingredients.split(",").map((i) => i.trim()),
      ingredientsUz: formData.ingredientsUz.split(",").map((i) => i.trim()),
      ingredientsRu: formData.ingredientsRu.split(",").map((i) => i.trim()),
    }

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData)
      toast.success("Taom yangilandi")
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...itemData,
      }
      addMenuItem(newItem)
      toast.success("Taom qo'shildi")
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      nameUz: item.nameUz,
      nameRu: item.nameRu,
      description: item.description,
      descriptionUz: item.descriptionUz,
      descriptionRu: item.descriptionRu,
      image: item.image,
      price: item.price,
      weight: item.weight,
      ingredients: item.ingredients.join(", "),
      ingredientsUz: item.ingredientsUz.join(", "),
      ingredientsRu: item.ingredientsRu.join(", "),
      rating: item.rating,
      prepTime: item.prepTime,
      categoryId: item.categoryId,
      available: item.available,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Taomni o'chirishni xohlaysizmi?")) {
      deleteMenuItem(id)
      toast.success("Taom o'chirildi")
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      nameUz: "",
      nameRu: "",
      description: "",
      descriptionUz: "",
      descriptionRu: "",
      image: "",
      price: 0,
      weight: 0,
      ingredients: "",
      ingredientsUz: "",
      ingredientsRu: "",
      rating: 5,
      prepTime: 15,
      categoryId: "",
      available: true,
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
                  <Label htmlFor="nameUz" className="text-white text-sm">
                    Nomi (UZ)
                  </Label>
                  <Input
                    id="nameUz"
                    value={formData.nameUz}
                    onChange={(e) => setFormData({ ...formData, nameUz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameRu" className="text-white text-sm">
                    Nomi (RU)
                  </Label>
                  <Input
                    id="nameRu"
                    value={formData.nameRu}
                    onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryId" className="text-white text-sm">
                    Kategoriya
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/20">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white">
                          {cat.nameUz}
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
                  <Image src={formData.image || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) })}
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
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number.parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white text-sm"
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
                    onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prepTime" className="text-white text-sm">
                    Tayyorlanish (min)
                  </Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: Number.parseInt(e.target.value) })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
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
                  <Label htmlFor="ingredientsUz" className="text-white text-sm">
                    Tarkibi (UZ, vergul bilan)
                  </Label>
                  <Textarea
                    id="ingredientsUz"
                    value={formData.ingredientsUz}
                    onChange={(e) => setFormData({ ...formData, ingredientsUz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    placeholder="Mahsulot 1, Mahsulot 2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ingredientsRu" className="text-white text-sm">
                    Tarkibi (RU, vergul bilan)
                  </Label>
                  <Textarea
                    id="ingredientsRu"
                    value={formData.ingredientsRu}
                    onChange={(e) => setFormData({ ...formData, ingredientsRu: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                    placeholder="Ингредиент 1, Ингредиент 2"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                {editingItem ? "Yangilash" : "Qo'shish"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl"
          >
            <div className="relative h-32">
              <Image src={item.image || "/placeholder.svg"} alt={item.nameUz} fill className="object-cover" />
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">{item.nameUz}</h3>
                  <p className="text-xs sm:text-sm text-white/60">
                    {item.price.toLocaleString()} so'm • {item.weight}g
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
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
