"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Feedback } from "./types"

interface FeedbackContextType {
  feedbacks: Feedback[]
  addFeedback: (feedback: Omit<Feedback, "id" | "date" | "read">) => void
  markAsRead: (id: string) => void
  deleteFeedback: (id: string) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("feedbacks")
    if (stored) {
      setFeedbacks(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks))
  }, [feedbacks])

  const addFeedback = (feedback: Omit<Feedback, "id" | "date" | "read">) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
    }
    setFeedbacks((prev) => [newFeedback, ...prev])
  }

  const markAsRead = (id: string) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, read: true } : f)))
  }

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <FeedbackContext.Provider value={{ feedbacks, addFeedback, markAsRead, deleteFeedback }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider")
  }
  return context
}
