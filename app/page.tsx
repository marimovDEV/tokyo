import { HeroSection } from "@/components/hero-section"
import { PromotionsSection } from "@/components/promotions-section"
import Link from "next/link"
import { ArrowRight, Star, Clock, Users } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <div
        className="relative bg-cover md:bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/tokyo-restaurant-night.png)",
          backgroundPosition: "center 30%",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10">
          <HeroSection />
        </div>
      </div>
      <PromotionsSection />
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Yuqori Sifat</h3>
              <p className="text-white/70 leading-relaxed">Faqat eng yaxshi ingredientlar va professional oshpazlar bilan tayyorlanadi</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Tez Tayyorlash</h3>
              <p className="text-white/70 leading-relaxed">15-25 daqiqada tayyor bo'lgan taomlar, tezkor xizmat</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Do'stona Xizmat</h3>
              <p className="text-white/70 leading-relaxed">Mehmonlarimizning qulayligi bizning birinchi ustuvorligimiz</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Hoziroq Buyurtma Bering!
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Yapon taomlarining haqiqiy ta'mini his eting. Bizning restoranimizda sizni kutayapmiz!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/menu"
              className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            >
              Menuni Ko'rish
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="tel:+998901234567"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-amber-600 transition-all hover:scale-105"
            >
              Qo'ng'iroq Qilish
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
