"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Phone, Instagram, Send, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const translations = {
    uz: {
        slogan: "Sushi • Shashlik • Pizza",
        menu: "Menyu",
        contact: "Bog'lanish",
    },
    ru: {
        slogan: "Суши • Шашлык • Пицца",
        menu: "Меню",
        contact: "Контакты",
    },
    en: {
        slogan: "Sushi • Kebab • Pizza",
        menu: "Menu",
        contact: "Contact",
    },
}

export function Header() {
    const { language, setLanguage } = useLanguage()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const t = translations[language]

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const languages = [
        { code: "uz", label: "UZ", flag: "🇺🇿" },
        { code: "ru", label: "RU", flag: "🇷🇺" },
        { code: "en", label: "EN", flag: "🇬🇧" },
    ] as const

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo & Slogan */}
                <Link href="/" className="flex flex-col group">
                    <h1 className={cn("text-2xl font-bold text-white transition-all group-hover:text-amber-500",
                        isScrolled ? "text-xl" : "text-2xl md:text-3xl")}>
                        TOKYO
                    </h1>
                    <span className="text-[10px] md:text-xs text-white/70 tracking-wider uppercase font-medium group-hover:text-white transition-colors">
                        {t.slogan}
                    </span>
                </Link>

                {/* Desktop Nav & Lang */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Socials */}
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                        <a href="https://instagram.com/tokyo.urgench" target="_blank" className="text-white/70 hover:text-amber-500 transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://t.me/PizzaCentr_Bot" target="_blank" className="text-white/70 hover:text-amber-500 transition-colors">
                            <Send className="w-5 h-5" />
                        </a>
                        <a href="tel:+998914331110" className="text-white/70 hover:text-amber-500 transition-colors">
                            <Phone className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex bg-white/10 rounded-full p-1 backdrop-blur-sm">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1",
                                    language === lang.code
                                        ? "bg-amber-500 text-white shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.label}</span>
                            </button>
                        ))}
                    </div>

                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6">
                        <Link href="/menu">{t.menu}</Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-3">
                    {/* Simple Lang Switcher for Mobile */}
                    <button
                        onClick={() => setLanguage(language === 'uz' ? 'ru' : language === 'ru' ? 'en' : 'uz')}
                        className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                    >
                        <span>{languages.find(l => l.code === language)?.flag}</span>
                        <span>{languages.find(l => l.code === language)?.label}</span>
                    </button>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-white p-2 hover:bg-white/10 rounded-full transition"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 md:hidden">
                    <Link href="/menu" className="bg-amber-500 text-white py-3 rounded-xl text-center font-bold" onClick={() => setMobileMenuOpen(false)}>
                        {t.menu}
                    </Link>
                    <div className="flex justify-center gap-6 py-4 border-t border-white/10">
                        <a href="https://instagram.com/tokyo.urgench" target="_blank" className="text-white hover:text-amber-500">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="https://t.me/PizzaCentr_Bot" target="_blank" className="text-white hover:text-amber-500">
                            <Send className="w-6 h-6" />
                        </a>
                        <a href="tel:+998914331110" className="text-white hover:text-amber-500">
                            <Phone className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            )}
        </header>
    )
}
