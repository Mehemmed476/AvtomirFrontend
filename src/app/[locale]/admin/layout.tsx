"use client";

import { usePathname } from "@/i18n/routing";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminAuthGuard from "@/components/auth/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname.includes("/login");

  // --- SENARİ 1: LOGIN SƏHİFƏSİ ---
  // Sidebar YOXDUR, sadə mərkəzləşmiş ekran
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        {children}
      </div>
    );
  }

  // --- SENARİ 2: NORMAL ADMIN PANELİ ---
  // Sidebar VAR, Header VAR, Authentication Guard VAR
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">

        {/* Sol Tərəf - Sidebar */}
        <AdminSidebar />

        {/* Sağ Tərəf - Məzmun */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

          {/* Admin Header */}
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Xoş gəldiniz, Admin</h2>
                <p className="text-xs text-slate-500">Panel İdarəetmə Mərkəzi</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold shadow-sm">
                  A
                </div>
              </div>
          </header>

          {/* Scroll olunan sahə */}
          <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
              {children}
            </div>
          </main>

        </div>

      </div>
    </AdminAuthGuard>
  );
}