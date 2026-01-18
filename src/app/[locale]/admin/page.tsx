"use client";

import { Package, FolderTree, ListFilter, Settings, Plus, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminDashboard() {
  const quickActions = [
    {
      title: "Yeni Məhsul",
      description: "Yeni məhsul əlavə edin",
      href: "/admin/products/create",
      icon: Plus,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20 hover:border-blue-500/40"
    },
    {
      title: "Yeni Kateqoriya",
      description: "Yeni kateqoriya yaradın",
      href: "/admin/categories/create",
      icon: Plus,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20 hover:border-purple-500/40"
    }
  ];

  const managementLinks = [
    {
      title: "Məhsullar",
      description: "Bütün məhsulları idarə edin",
      href: "/admin/products",
      icon: Package,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20"
    },
    {
      title: "Kateqoriyalar",
      description: "Kateqoriyaları idarə edin",
      href: "/admin/categories",
      icon: FolderTree,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Xoş gəldiniz! Admin panelinə xoş gəldiniz.</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-400" />
          Sürətli Əməliyyatlar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`group flex items-center gap-4 p-5 bg-gradient-to-r ${action.bgGradient} border ${action.borderColor} rounded-2xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg ${action.shadow}`}>
                <action.icon size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {action.title}
                </p>
                <p className="text-sm text-slate-400">{action.description}</p>
              </div>
              <ArrowRight size={20} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Management Links */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={20} className="text-purple-400" />
          İdarəetmə
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {managementLinks.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-300 hover:bg-slate-800/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-lg ${link.shadow}`}>
                  <link.icon size={22} className="text-white" />
                </div>
                <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                {link.title}
              </h3>
              <p className="text-sm text-slate-400">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <ListFilter size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Admin Panel</h3>
            <p className="text-sm text-slate-400">
              Bu paneldən məhsulları və kateqoriyaları idarə edə bilərsiniz.
              Yuxarıdakı sürətli əməliyyatlardan istifadə edərək yeni məhsul və ya kateqoriya əlavə edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
