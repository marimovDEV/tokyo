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

  const getTypeColor = (type: "suggestion" | "complaint") => {
    if (type === "complaint") {
      return "bg-red-500/20 border-red-500/30 text-red-300"
    }
    return "bg-green-500/20 border-green-500/30 text-green-300"
  }

  const getTypeIcon = (type: "suggestion" | "complaint") => {
    if (type === "complaint") {
      return "⚠️"
    }
    return "💡"
  }

  const getTypeLabel = (type: "suggestion" | "complaint") => {
    if (type === "complaint") {
      return "Shikoyat"
    }
    return "Taklif"
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
              className={`backdrop-blur-xl rounded-2xl p-6 border hover:bg-opacity-20 transition-all ${
                feedback.type === "complaint" 
                  ? "bg-red-500/10 border-red-500/30" 
                  : "bg-green-500/10 border-green-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{feedback.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(feedback.type)}`}>
                      <span className="mr-1">{getTypeIcon(feedback.type)}</span>
                      {getTypeLabel(feedback.type)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-white/70">
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

              <div className={`rounded-xl p-4 border ${
                feedback.type === "complaint"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-green-500/5 border-green-500/20"
              }`}>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
              </div>

              <div className="mt-4 text-xs text-white/50">
                {new Date(feedback.date).toLocaleString("uz-UZ", {
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
