"use client";

import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Package, List, Settings, LogOut, Home, ShieldCheck } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Məhsullar", icon: Package },
    { href: "/admin/categories", label: "Kateqoriyalar", icon: List },
    { href: "/admin/settings", label: "Tənzimləmələr", icon: Settings },
  ];

  return (
    <aside className="w-72 bg-blue-900 text-white min-h-screen flex flex-col shrink-0 shadow-xl z-20 transition-all">
      
      {/* Logo Sahəsi */}
      <div className="h-20 flex items-center px-8 border-b border-blue-800/50">
        <Link href="/admin" className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity">
          <ShieldCheck className="text-blue-300" size={28} />
          <span>AVTOMİR</span>
        </Link>
      </div>

      {/* Menyu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-xs font-bold text-blue-300/60 uppercase tracking-widest mb-3">İdarəetmə</p>
        
        {links.map((link) => {
          // --- VACİB SƏTİR: Bunu unutma! ---
          const Icon = link.icon; 
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-semibold
                ${isActive 
                  ? "bg-white text-blue-900 shadow-md translate-x-1" 
                  : "text-blue-100 hover:bg-blue-800 hover:text-white hover:translate-x-1"}
              `}
            >
              <Icon size={20} className={isActive ? "text-blue-600" : "text-blue-300"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer (Sayta Qayıt & Çıxış) */}
      <div className="p-4 border-t border-blue-800/50 space-y-2 bg-blue-950/30">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-all"
        >
          <Home size={18} /> Sayta Qayıt
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all">
          <LogOut size={18} /> Çıxış
        </button>
      </div>

    </aside>
  );
}