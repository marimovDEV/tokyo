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
  { value: 'homepage', label: 'Bosh sahifa' },
  { value: 'menu', label: 'Menyu sahifasi' },
  { value: 'about', label: 'Biz haqimizda' },
  { value: 'contact', label: 'Aloqa' },
  { value: 'footer', label: 'Pastki qism' },
  { value: 'header', label: 'Yuqori qism' },
  { value: 'general', label: 'Umumiy' },
  { value: 'notifications', label: 'Bildirishnomalar' },
  { value: 'forms', label: 'Formalar' },
  { value: 'errors', label: 'Xatolar' },
  { value: 'success', label: 'Muvaffaqiyat' },
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
    title: "",
    subtitle: "",
    description: "",
    content: "",
    button_text: "",
    title_uz: "",
    subtitle_uz: "",
    description_uz: "",
    content_uz: "",
    button_text_uz: "",
    title_ru: "",
    subtitle_ru: "",
    description_ru: "",
    content_ru: "",
    button_text_ru: "",
    is_active: true,
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (editingContent) {
        // Update existing content
        const contentId = parseInt(editingContent.id)
        const updatedContent = await api.patch(`/text-content/${contentId}/`, formData)
        toast.success("Matn yangilandi")
      } else {
        // Create new content
        const newContent = await api.post('/text-content/', formData)
        toast.success("Matn qo'shildi")
      }
      
      refetch()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving text content:', error)
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (content: TextContent) => {
    setEditingContent(content)
    setFormData({
      content_type: content.content_type,
      key: content.key,
      title: content.title || "",
      subtitle: content.subtitle || "",
      description: content.description || "",
      content: content.content || "",
      button_text: content.button_text || "",
      title_uz: content.title_uz || "",
      subtitle_uz: content.subtitle_uz || "",
      description_uz: content.description_uz || "",
      content_uz: content.content_uz || "",
      button_text_uz: content.button_text_uz || "",
      title_ru: content.title_ru || "",
      subtitle_ru: content.subtitle_ru || "",
      description_ru: content.description_ru || "",
      content_ru: content.content_ru || "",
      button_text_ru: content.button_text_ru || "",
      is_active: content.is_active !== false,
      order: content.order || 0,
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
        const contentId = parseInt(contentToDelete.id)
        await api.delete(`/text-content/${contentId}/`)
        refetch()
        toast.success("Matn o'chirildi")
        setDeleteDialogOpen(false)
        setContentToDelete(null)
      } catch (error) {
        console.error('Error deleting text content:', error)
        toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  const resetForm = () => {
    setEditingContent(null)
    setFormData({
      content_type: "homepage",
      key: "",
      title: "",
      subtitle: "",
      description: "",
      content: "",
      button_text: "",
      title_uz: "",
      subtitle_uz: "",
      description_uz: "",
      content_uz: "",
      button_text_uz: "",
      title_ru: "",
      subtitle_ru: "",
      description_ru: "",
      content_ru: "",
      button_text_ru: "",
      is_active: true,
      order: textContent.length + 1,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Matn Kontenti</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Matn Qo'shish
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingContent ? "Matnni Tahrirlash" : "Yangi Matn Qo'shish"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="content_type" className="text-white text-sm">
                    Kontent Turi
                  </Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Kontent turini tanlang" />
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
                    Kalit
                  </Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="unique_key_name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order" className="text-white text-sm">
                    Tartib Raqami
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    required
                  />
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

              {/* English Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  🇺🇸 Inglizcha Kontent
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-white text-sm">Sarlavha</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle" className="text-white text-sm">Pastki Sarlavha</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white text-sm">Tavsif</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-white text-sm">Kontent</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="button_text" className="text-white text-sm">Tugma Matni</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
              </div>

              {/* Uzbek Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  🇺🇿 O'zbekcha Kontent
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_uz" className="text-white text-sm">Sarlavha</Label>
                    <Input
                      id="title_uz"
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle_uz" className="text-white text-sm">Pastki Sarlavha</Label>
                    <Input
                      id="subtitle_uz"
                      value={formData.subtitle_uz}
                      onChange={(e) => setFormData({ ...formData, subtitle_uz: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description_uz" className="text-white text-sm">Tavsif</Label>
                  <Textarea
                    id="description_uz"
                    value={formData.description_uz}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_uz" className="text-white text-sm">Kontent</Label>
                  <Textarea
                    id="content_uz"
                    value={formData.content_uz}
                    onChange={(e) => setFormData({ ...formData, content_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="button_text_uz" className="text-white text-sm">Tugma Matni</Label>
                  <Input
                    id="button_text_uz"
                    value={formData.button_text_uz}
                    onChange={(e) => setFormData({ ...formData, button_text_uz: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
              </div>

              {/* Russian Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  🇷🇺 Ruscha Kontent
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_ru" className="text-white text-sm">Sarlavha</Label>
                    <Input
                      id="title_ru"
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle_ru" className="text-white text-sm">Pastki Sarlavha</Label>
                    <Input
                      id="subtitle_ru"
                      value={formData.subtitle_ru}
                      onChange={(e) => setFormData({ ...formData, subtitle_ru: e.target.value })}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description_ru" className="text-white text-sm">Tavsif</Label>
                  <Textarea
                    id="description_ru"
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_ru" className="text-white text-sm">Kontent</Label>
                  <Textarea
                    id="content_ru"
                    value={formData.content_ru}
                    onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="button_text_ru" className="text-white text-sm">Tugma Matni</Label>
                  <Input
                    id="button_text_ru"
                    value={formData.button_text_ru}
                    onChange={(e) => setFormData({ ...formData, button_text_ru: e.target.value })}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-white/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Bekor Qilish
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingContent ? "Yangilash" : "Qo'shish"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      {textContentLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-white" />
          <span className="ml-2 text-white">Yuklanmoqda...</span>
        </div>
      ) : textContent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">Hozircha matn kontenti yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {textContent.map((content) => (
            <div key={content.id} className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {content.title_uz || content.title || content.key}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {CONTENT_TYPES.find(type => type.value === content.content_type)?.label || content.content_type}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{content.key}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(content)}
                    className="h-8 w-8 p-0 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(content)}
                    className="h-8 w-8 p-0 border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {content.title_uz && (
                  <div className="text-xs">
                    <span className="text-gray-400">🇺🇿:</span>
                    <span className="text-white ml-1">{content.title_uz}</span>
                  </div>
                )}
                {content.title_ru && (
                  <div className="text-xs">
                    <span className="text-gray-400">🇷🇺:</span>
                    <span className="text-white ml-1">{content.title_ru}</span>
                  </div>
                )}
                {content.title && (
                  <div className="text-xs">
                    <span className="text-gray-400">🇺🇸:</span>
                    <span className="text-white ml-1">{content.title}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  content.is_active 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {content.is_active ? 'Faol' : 'Nofaol'}
                </span>
                <span className="text-xs text-gray-400">
                  #{content.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Matnni O'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Bu matnni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Bekor Qilish
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
