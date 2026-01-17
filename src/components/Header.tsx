"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react"; // Lazımsız ikonları sildik (Search, Cart, User)
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("Nav");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname(); 
  if (pathname.includes("/admin")) return null;
  
  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header 
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b
        ${isScrolled 
          ? "bg-dark-900/95 border-dark-700 shadow-xl backdrop-blur-md" 
          : "bg-transparent border-transparent"}
      `}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* 1. LOGO */}
        <Link href="/" className="text-3xl font-bold text-white tracking-tighter hover:scale-105 transition-transform">
          AVTO<span className="text-primary">MIR</span>
        </Link>

        {/* 2. DESKTOP MENYU (Ortada) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-gray-300 hover:text-primary transition-colors font-medium text-sm uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. SAĞ TƏRƏF (Yalnız Dil Dəyişən) */}
        <div className="hidden md:flex items-center gap-5">
          <LanguageSwitcher />
        </div>

        {/* 4. MOBİL MENYU DÜYMƏSİ */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 5. MOBİL MENYU AÇILANI */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-dark-900 border-b border-dark-700 shadow-2xl animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-gray-200 py-3 border-b border-dark-800 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobildə Dil Dəyişən */}
            <div className="mt-4 pt-4 border-t border-dark-700 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}