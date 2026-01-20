"use client";

import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Package, FolderTree, LogOut, ExternalLink, Sparkles, Play, Settings } from "lucide-react";
import { logout } from "@/lib/auth";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, description: "Ümumi baxış" },
    { href: "/admin/products", label: "Məhsullar", icon: Package, description: "Məhsul idarəsi" },
    { href: "/admin/categories", label: "Kateqoriyalar", icon: FolderTree, description: "Kateqoriya idarəsi" },
    { href: "/admin/shorts", label: "Qısa Videolar", icon: Play, description: "YouTube Shorts" },
    { href: "/admin/settings", label: "Ayarlar", icon: Settings, description: "Sayt ayarları" },
  ];

  const handleLogout = () => {
    if (confirm("Çıxış etmək istədiyinizə əminsiniz?")) {
      logout();
    }
  };

  return (
    <aside className="w-72 bg-slate-900/50 backdrop-blur-xl text-white min-h-screen flex flex-col shrink-0 border-r border-slate-800/50 z-20">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">AVTOMİR</span>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Əsas Menyu</p>

        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href ||
              (link.href !== "/admin" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative
                  ${isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full" />
                )}

                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-all
                  ${isActive
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
                    : "bg-slate-800/50 group-hover:bg-slate-700/50"}
                `}>
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : ""}`}>
                    {link.label}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/50 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800/50 group-hover:bg-emerald-500/20 flex items-center justify-center transition-all">
            <ExternalLink size={16} className="group-hover:text-emerald-400" />
          </div>
          Sayta Qayıt
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800/50 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
            <LogOut size={16} className="group-hover:text-red-400" />
          </div>
          Çıxış
        </button>
      </div>
    </aside>
  );
}