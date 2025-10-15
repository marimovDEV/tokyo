"use client"
import { ArrowLeft, Package, Tag, Megaphone, MessageSquare, LogOut } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/admin/categories-tab"
import { MenuItemsTab } from "@/components/admin/menu-items-tab"
import { PromotionsTab } from "@/components/admin/promotions-tab"
import { FeedbackTab } from "@/components/admin/feedback-tab"
import { toast } from "sonner"

export default function AdminPage() {
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminAuth")
    }
    toast.success("Chiqish muvaffaqiyatli!")
    window.location.href = "/admin/login"
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 bg-[url('/tokyo-restaurant-night.png')] bg-cover bg-center bg-fixed opacity-10 pointer-events-none" />
      <div className="relative z-10 container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 md:gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              <ArrowLeft className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </Link>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white">Admin Panel</h1>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 backdrop-blur-xl flex items-center justify-center hover:bg-red-500/30 transition-all border border-red-500/30"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
          </button>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1 mb-6 md:mb-8 grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl gap-1 md:gap-0">
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg text-xs md:text-sm px-2 md:px-3 py-2 md:py-2.5"
            >
              <Tag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Kategoriyalar</span>
              <span className="sm:hidden">Kat.</span>
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg text-xs md:text-sm px-2 md:px-3 py-2 md:py-2.5"
            >
              <Package className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Taomlar</span>
              <span className="sm:hidden">Taom</span>
            </TabsTrigger>
            <TabsTrigger
              value="promotions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg text-xs md:text-sm px-2 md:px-3 py-2 md:py-2.5"
            >
              <Megaphone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Aksiyalar</span>
              <span className="sm:hidden">Aks.</span>
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg text-xs md:text-sm px-2 md:px-3 py-2 md:py-2.5"
            >
              <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Fikrlar</span>
              <span className="sm:hidden">Fikr</span>
            </TabsTrigger>
          </TabsList>

            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>

            <TabsContent value="items">
              <MenuItemsTab />
            </TabsContent>

            <TabsContent value="promotions">
              <PromotionsTab />
            </TabsContent>

            <TabsContent value="feedback">
              <FeedbackTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
