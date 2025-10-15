"use client"
import { ArrowLeft, Package, Tag, Megaphone, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/admin/categories-tab"
import { MenuItemsTab } from "@/components/admin/menu-items-tab"
import { PromotionsTab } from "@/components/admin/promotions-tab"
import { FeedbackTab } from "@/components/admin/feedback-tab"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="relative">
        <div className="absolute inset-0 bg-[url('/tokyo-restaurant-night.png')] bg-cover bg-center opacity-10" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all border border-white/30"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Panel</h1>
          </div>

          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1 mb-8 grid grid-cols-4 w-full max-w-3xl">
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg"
              >
                <Tag className="w-4 h-4 mr-2" />
                Kategoriyalar
              </TabsTrigger>
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg"
              >
                <Package className="w-4 h-4 mr-2" />
                Taomlar
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg"
              >
                <Megaphone className="w-4 h-4 mr-2" />
                Aksiyalar
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-white/70 rounded-lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Fikrlar
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
