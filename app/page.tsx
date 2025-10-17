import { HeroSection } from "@/components/hero-section"
import { PromotionsSection } from "@/components/promotions-section"
import { Footer } from "@/components/footer"
import Link from "next/link"

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
      
      {/* Menu Section */}
      <section id="menu-section" className="py-16 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Bizning Menyu
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Tokyo restoranining eng yaxshi taomlarini tatib ko'ring
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105"
          >
            <span>Menyuni Ko'rish</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
