"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Edit, Trash2, Plus, FileText, Loader2 } from "lucide-react"
import { useApiClient } from "@/hooks/use-api"
import { useTextContent, TextContent } from "@/hooks/use-text-content"

const CONTENT_TYPES = [
  { value: 'homepage', label: '🏠 Bosh sahifa matnlari' },
  { value: 'menu', label: '🍽️ Menyu sahifasi matnlari' },
  { value: 'about', label: 'ℹ️ Biz haqimizda matnlari' },
  { value: 'contact', label: '📞 Aloqa matnlari' },
  { value: 'footer', label: '📄 Pastki qism matnlari' },
  { value: 'header', label: '📋 Yuqori qism matnlari' },
]

export function TextContentTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<TextContent | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<TextContent | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { textContent, loading: textContentLoading, refetch } = useTextContent()
  const api = useApiClient()

  const [formData, setFormData] = useState({
    content_type: "homepage",
    key: "",
    title_uz: "", // O'zbekcha sarlavha
    title_ru: "", // Ruscha sarlavha
    description_uz: "", // O'zbekcha tavsif
    description_ru: "", // Ruscha tavsif
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (editingContent) {
        // Update existing content
        const contentId = parseInt(editingContent.id)
        const updatedContent = await api.patch(`/text-content/${contentId}/`, formData)
        toast.success("✅ Matn muvaffaqiyatli yangilandi!")
      } else {
        // Create new content
        const newContent = await api.post('/text-content/', formData)
        toast.success("✅ Yangi matn muvaffaqiyatli qo'shildi!")
      }
      
      refetch()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving text content:', error)
      toast.error("❌ Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (content: TextContent) => {
    setEditingContent(content)
    setFormData({
      content_type: content.content_type,
      key: content.key,
      title_uz: content.title_uz || "",
      title_ru: content.title_ru || "",
      description_uz: content.description_uz || "",
      description_ru: content.description_ru || "",
      is_active: content.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (content: TextContent) => {
    setContentToDelete(content)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (contentToDelete) {
      try {
        await api.delete(`/text-content/${contentToDelete.id}/`)
        refetch()
        toast.success("✅ Matn muvaffaqiyatli o'chirildi!")
        setDeleteDialogOpen(false)
        setContentToDelete(null)
      } catch (error) {
        console.error('Error deleting text content:', error)
        toast.error("❌ Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setContentToDelete(null)
  }

  const resetForm = () => {
    setEditingContent(null)
    setFormData({
      content_type: "homepage",
      key: "",
      title_uz: "",
      title_ru: "",
      description_uz: "",
      description_ru: "",
      is_active: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">📝 Sayt Matnlari</h2>
            <p className="text-sm text-white/60">Saytda ko'rinadigan barcha matnlarni boshqarish</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi Matn
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingContent ? "✏️ Matnni O'zgartirish" : "➕ Yangi Matn Qo'shish"}
              </DialogTitle>
              <p className="text-sm text-white/60">
                {editingContent ? "Mavjud matnni o'zgartiring" : "Saytda yangi matn yarating"}
              </p>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asosiy Ma'lumotlar */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">📍 Qaysi sahifada ko'rinadi?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_type" className="text-white text-sm">
                      📄 Sahifa
                    </Label>
                    <Select
                      value={formData.content_type}
                      onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Sahifani tanlang" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        {CONTENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="key" className="text-white text-sm">
                      🔑 Matn nomi (texnik)
                    </Label>
                    <Input
                      id="key"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="masalan: hero_title"
                      required
                    />
                    <p className="text-xs text-white/50 mt-1">Bu nom faqat texnik maqsadda ishlatiladi</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="text-white text-sm">
                    ✅ Matn ko'rinadi
                  </Label>
                </div>
              </div>

              {/* O'zbekcha Matn */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">🇺🇿 O'zbekcha Matn</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title_uz" className="text-white text-sm">
                      📝 Sarlavha (O'zbekcha)
                    </Label>
                    <Input
                      id="title_uz"
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="Masalan: Tokyo Restoraniga Xush Kelibsiz"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description_uz" className="text-white text-sm">
                      📄 Tavsif (O'zbekcha)
                    </Label>
                    <Textarea
                      id="description_uz"
                      value={formData.description_uz}
                      onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                      placeholder="Matnning to'liq tavsifini kiriting..."
                    />
                  </div>
                </div>
              </div>

              {/* Ruscha Matn */}
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">🇷🇺 Ruscha Matn</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title_ru" className="text-white text-sm">
                      📝 Sarlavha (Ruscha)
                    </Label>
                    <Input
                      id="title_ru"
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      placeholder="Masalan: Добро пожаловать в Tokyo Restaurant"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description_ru" className="text-white text-sm">
                      📄 Tavsif (Ruscha)
                    </Label>
                    <Textarea
                      id="description_ru"
                      value={formData.description_ru}
                      onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                      placeholder="Введите полное описание текста..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : editingContent ? (
                    "Matnni Yangilash"
                  ) : (
                    "Matnni Qo'shish"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      {textContentLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="ml-2 text-white">Matnlar yuklanmoqda...</span>
        </div>
      ) : textContent.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">Hozircha hech qanday matn yo'q</p>
          <p className="text-white/40 text-sm">Yangi matn qo'shish uchun yuqoridagi tugmani bosing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {textContent.map((content) => (
            <div key={content.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {content.title_uz || content.title_ru || content.key}
                  </h3>
                  <p className="text-white/60 text-xs">
                    📍 {CONTENT_TYPES.find(t => t.value === content.content_type)?.label || content.content_type}
                  </p>
                  <p className="text-white/50 text-xs">🔑 {content.key}</p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(content)}
                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClick(content)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {content.title_uz && (
                  <div>
                    <p className="text-xs text-white/50">🇺🇿 Sarlavha:</p>
                    <p className="text-xs text-white/80 line-clamp-2">{content.title_uz}</p>
                  </div>
                )}
                {content.title_ru && (
                  <div>
                    <p className="text-xs text-white/50">🇷🇺 Заголовок:</p>
                    <p className="text-xs text-white/80 line-clamp-2">{content.title_ru}</p>
                  </div>
                )}
                {content.description_uz && (
                  <div>
                    <p className="text-xs text-white/50">🇺🇿 Tavsif:</p>
                    <p className="text-xs text-white/80 line-clamp-3">{content.description_uz}</p>
                  </div>
                )}
                {content.description_ru && (
                  <div>
                    <p className="text-xs text-white/50">🇷🇺 Описание:</p>
                    <p className="text-xs text-white/80 line-clamp-3">{content.description_ru}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className={`px-2 py-1 rounded-full text-xs ${
                  content.is_active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {content.is_active ? '✅ Ko\'rinadi' : '❌ Yashirin'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">🗑️ Matnni O'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Bu matnni o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} className="border-white/20 text-white hover:bg-white/10">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 text-white">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}