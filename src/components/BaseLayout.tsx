"use client";

import { usePathname } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Settings } from "@/types";

interface BaseLayoutProps {
  children: React.ReactNode;
  settings?: Settings | null;
}

export default function BaseLayout({ children, settings }: BaseLayoutProps) {
  const pathname = usePathname();

  // Admin və ya Login səhifəsi olduğunu yoxlayırıq
  const isAdminArea = pathname.includes("/admin") || pathname.includes("/login");

  // --- SENARI 1: ADMIN PANELI ---
  if (isAdminArea) {
    return (
      // Buranı MƏCBURİ şəkildə AĞ/BOZ edirik və tam ekranı tutmasını təmin edirik
      <div className="min-h-screen w-full bg-slate-50 text-slate-900">
        {children}
      </div>
    );
  }

  // --- SENARI 2: MÜŞTƏRİ SAYTI ---
  return (
    // Buranı MƏCBURİ şəkildə QARA edirik
    <div className="min-h-screen w-full bg-dark-900 text-dark-text flex flex-col">
      <Header />

      {/* Header-in altında qalmasın deyə padding */}
      <main className="flex-1 pt-24">
        {children}
      </main>

      <Footer settings={settings} />
    </div>
  );
}