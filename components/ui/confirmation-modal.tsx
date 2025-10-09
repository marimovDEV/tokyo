"use client"

import React, { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "destructive",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 sm:mx-0 bg-background border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-full ${
              variant === "destructive" 
                ? "bg-red-100 text-red-600" 
                : "bg-amber-100 text-amber-600"
            }`}>
              {variant === "destructive" ? (
                <Trash2 className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-xl font-semibold text-foreground">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-base text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border-2 hover:bg-muted/50 transition-colors"
          >
            {cancelText || "Bekor qilish"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-6 py-2 font-semibold transition-all duration-200 ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yuklanmoqda...
              </div>
            ) : (
              confirmText || "OK"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easier usage
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    onConfirm: () => void
  } | null>(null)

  const showConfirmation = useCallback((config: {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    onConfirm: () => void
  }) => {
    setConfig(config)
    setIsOpen(true)
  }, [])

  const hideConfirmation = useCallback(() => {
    setIsOpen(false)
    setConfig(null)
  }, [])

  const ConfirmationModalComponent = React.useMemo(() => {
    if (!config) return null
    
    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={config.onConfirm}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
      />
    )
  }, [isOpen, config, hideConfirmation])

  return {
    showConfirmation,
    ConfirmationModal: ConfirmationModalComponent,
  }
}