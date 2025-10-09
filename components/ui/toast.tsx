"use client"

import React, { useEffect, useState } from "react"
import { Check, X, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 2000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Return a fallback function if not in provider context
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {}
    }
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastProps[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }: { toast: ToastProps, onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <Check className="h-5 w-5 text-green-600" />
      case "error":
        return <X className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Check className="h-5 w-5 text-green-600" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-white border-green-200 shadow-green-100"
      case "error":
        return "bg-white border-red-200 shadow-red-100"
      case "warning":
        return "bg-white border-yellow-200 shadow-yellow-100"
      case "info":
        return "bg-white border-blue-200 shadow-blue-100"
      default:
        return "bg-white border-green-200 shadow-green-100"
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl border shadow-lg max-w-sm w-full transition-all duration-300 transform",
        getStyles(),
        isVisible 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">
          {toast.description}
        </p>
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  )
}