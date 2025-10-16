"use client"

import { useFeedback } from "@/lib/feedback-context"
import { useApiClient } from "@/hooks/use-api"
import { Trash2, Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function FeedbackTab() {
  const { feedbacks, deleteFeedback } = useFeedback()
  const api = useApiClient()

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu fikrni o'chirmoqchimisiz?")) {
      try {
        const feedbackId = parseInt(id)
        await api.delete(`/feedback/${feedbackId}/`)
        deleteFeedback(id)
        toast.success("Fikr o'chirildi")
      } catch (error) {
        console.error('Error deleting feedback:', error)
        toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Takliflar va Shikoyatlar</h2>
        <div className="text-white/60">Jami: {feedbacks.length}</div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 border border-white/20 text-center">
          <MessageSquare className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-lg">Hozircha fikrlar yo'q</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{feedback.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
                    {feedback.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${feedback.email}`} className="hover:text-amber-400 transition-colors">
                          {feedback.email}
                        </a>
                      </div>
                    )}
                    {feedback.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${feedback.phone}`} className="hover:text-amber-400 transition-colors">
                          {feedback.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(feedback.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
              </div>

              <div className="mt-4 text-xs text-white/50">
                {new Date(feedback.createdAt).toLocaleString("uz-UZ", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
