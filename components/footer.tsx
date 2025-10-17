"use client"

import { Phone, MessageCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Bron uchun telefon */}
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/30 text-center hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Bron uchun</h3>
            <p className="text-amber-400 font-semibold text-lg mb-4">+998 91 433 11 10</p>
            <Button 
              asChild
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full"
            >
              <a href="tel:+998914331110">
                Qo'ng'iroq qilish
              </a>
            </Button>
          </div>

          {/* Dostavka uchun telefon */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 text-center hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Dostavka uchun</h3>
            <p className="text-green-400 font-semibold text-lg mb-4">+998 94 231 10 10</p>
            <Button 
              asChild
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full"
            >
              <a href="tel:+998942311010">
                Qo'ng'iroq qilish
              </a>
            </Button>
          </div>

          {/* Telegram bot */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 text-center hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Telegram Bot</h3>
            <p className="text-blue-400 font-semibold text-lg mb-4">@PizzaCentr_Bot</p>
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-full"
            >
              <a href="https://t.me/PizzaCentr_Bot" target="_blank" rel="noopener noreferrer">
                Bot'ga o'tish
              </a>
            </Button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="text-center border-t border-white/10 pt-8">
          <h2 className="text-3xl font-bold text-white mb-4">Tokyo Restaurant</h2>
          <p className="text-white/70 text-lg mb-6">
            Haqiqiy yapon ta'mlari va professional xizmat
          </p>
          <div className="flex justify-center space-x-8 text-white/60">
            <p>© 2024 Tokyo Restaurant</p>
            <p>•</p>
            <p>Toshkent, O'zbekiston</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
