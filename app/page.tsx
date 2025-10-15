import { HeroSection } from "@/components/hero-section"
import { PromotionsSection } from "@/components/promotions-section"

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
    </main>
  )
}
