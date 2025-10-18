"use client"
import { ArrowLeft, Package, Tag, Megaphone, MessageSquare, LogOut } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/admin/categories-tab"
import { MenuItemsTab } from "@/components/admin/menu-items-tab"
import { PromotionsTab } from "@/components/admin/promotions-tab"
import { FeedbackTab } from "@/components/admin/feedback-tab"
import { ErrorBoundary } from "@/components/admin/error-boundary"
import { toast } from "sonner"
import { useState } from "react"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("categories")
  
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuth")
    }
    toast.success("Chiqish muvaffaqiyatli!")
    window.location.href = "/admin/login"
  }


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="fixed inset-0 bg-[url('/tokyo-restaurant-night.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none" />
        <div className="relative z-10">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-red-500/20 backdrop-blur-xl flex items-center justify-center hover:bg-red-500/30 transition-all border border-red-500/30"
              >
                <LogOut className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Kategoriyalar</span>
            </button>
            
            <button
              onClick={() => setActiveTab("items")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === "items"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Taomlar</span>
            </button>
            
            <button
              onClick={() => setActiveTab("promotions")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === "promotions"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span className="text-sm font-medium">Aksiyalar</span>
            </button>
            
            
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeTab === "feedback"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Fikrlar</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            <TabsContent value="categories">
              <ErrorBoundary>
                <CategoriesTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="items">
              <ErrorBoundary>
                <MenuItemsTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="promotions">
              <ErrorBoundary>
                <PromotionsTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="feedback">
              <ErrorBoundary>
                <FeedbackTab />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>

        </div>
      </div>
    </ErrorBoundary>
  )
}
