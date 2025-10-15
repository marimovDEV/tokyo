"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("adminAuth")
      if (auth === "true") {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="fixed inset-0 bg-[url('/tokyo-restaurant-night.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/70">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
