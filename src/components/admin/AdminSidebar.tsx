"use client";

import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Package, List, Settings, LogOut, Home } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Məhsullar", icon: Package },
    { href: "/admin/categories", label: "Kateqoriyalar", icon: List },
    { href: "/admin/settings", label: "Tənzimləmələr", icon: Settings },
  ];

  return (
    // DÜZƏLİŞ: Sidebar fixed deyil, flex container içində olacaq ki, üstə minməsin.
    // Rənglər: bg-white, border-gray-200
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/admin" className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          AVTOMİR <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600">PANEL</span>
        </Link>
      </div>

      {/* Menyu */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menyu</p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <Home size={18} /> Sayta Qayıt
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
          <LogOut size={18} /> Çıxış
        </button>
      </div>

    </aside>
  );
}