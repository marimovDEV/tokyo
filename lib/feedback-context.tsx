"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Feedback } from "./types"
import { apiClient } from "./api"

interface FeedbackContextType {
  feedbacks: Feedback[]
  loading: boolean
  addFeedback: (feedback: Omit<Feedback, "id" | "date" | "read">) => Promise<void>
  markAsRead: (id: number) => void
  deleteFeedback: (id: number) => void
  refreshFeedbacks: () => Promise<void>
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAllFeedbacks()
      setFeedbacks(response)
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const addFeedback = async (feedback: Omit<Feedback, "id" | "date" | "read">) => {
    try {
      const newFeedback = await apiClient.createFeedback(feedback)
      setFeedbacks((prev) => [newFeedback, ...prev])
    } catch (error) {
      console.error('Error creating feedback:', error)
      throw error
    }
  }

  const markAsRead = (id: number) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, is_read: true } : f)))
  }

  const deleteFeedback = (id: number) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id))
  }

  const refreshFeedbacks = async () => {
    await fetchFeedbacks()
  }

  return (
    <FeedbackContext.Provider value={{ 
      feedbacks, 
      loading, 
      addFeedback, 
      markAsRead, 
      deleteFeedback, 
      refreshFeedbacks 
    }}>
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
