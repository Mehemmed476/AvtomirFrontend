"use client";

import { useEffect, useState } from "react";
import { Package, FolderTree, Play, Settings, Plus, ArrowRight, TrendingUp, Eye, Calendar, Loader2, Box, Film } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getProducts, getCategories, getShortVideos, getImageUrl, ShortVideoGetDto } from "@/lib/api";
import { ProductListDto, Category } from "@/types";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalVideos: number;
  loading: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalVideos: 0,
    loading: true
  });
  const [recentProducts, setRecentProducts] = useState<ProductListDto[]>([]);
  const [recentVideos, setRecentVideos] = useState<ShortVideoGetDto[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [productsRes, categoriesRes, videosRes] = await Promise.all([
        getProducts(1, 5, { sort: 'newest' }),
        getCategories(),
        getShortVideos()
      ]);

      setStats({
        totalProducts: productsRes?.data?.totalCount || 0,
        totalCategories: countAllCategories(categoriesRes?.data || []),
        totalVideos: videosRes?.data?.length || 0,
        loading: false
      });

      setRecentProducts(productsRes?.data?.items || []);
      setRecentVideos((videosRes?.data || []).slice(0, 5));
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Count categories including children
  const countAllCategories = (categories: Category[]): number => {
    let count = 0;
    const countRecursive = (cats: Category[]) => {
      for (const cat of cats) {
        count++;
        if (cat.children && cat.children.length > 0) {
          countRecursive(cat.children);
        }
      }
    };
    countRecursive(categories);
    return count;
  };

  // YouTube video ID extraction
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const statCards = [
    {
      title: "Məhsullar",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      href: "/admin/products"
    },
    {
      title: "Kateqoriyalar",
      value: stats.totalCategories,
      icon: FolderTree,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      href: "/admin/categories"
    },
    {
      title: "Qısa Videolar",
      value: stats.totalVideos,
      icon: Play,
      gradient: "from-rose-500 to-orange-500",
      bgGradient: "from-rose-500/10 to-orange-500/10",
      borderColor: "border-rose-500/20",
      href: "/admin/shorts"
    }
  ];

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
    },
    {
      title: "Yeni Video",
      description: "YouTube Shorts əlavə edin",
      href: "/admin/shorts/create",
      icon: Film,
      gradient: "from-rose-500 to-orange-500",
      shadow: "shadow-rose-500/20",
      bgGradient: "from-rose-500/10 to-orange-500/10",
      borderColor: "border-rose-500/20 hover:border-rose-500/40"
    },
    {
      title: "Sayt Ayarları",
      description: "Əlaqə və sosial media",
      href: "/admin/settings",
      icon: Settings,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-2">Xoş gəldiniz! Saytınızın ümumi vəziyyətinə baxın.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className={`group bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={22} className="text-white" />
              </div>
              <TrendingUp size={20} className="text-slate-500 group-hover:text-green-400 transition-colors" />
            </div>
            <div>
              {stats.loading ? (
                <div className="h-9 flex items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              )}
              <p className="text-sm text-slate-400 mt-1">{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-400" />
          Sürətli Əməliyyatlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`group flex items-center gap-3 p-4 bg-gradient-to-r ${action.bgGradient} border ${action.borderColor} rounded-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center shadow-lg ${action.shadow}`}>
                <action.icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                  {action.title}
                </p>
                <p className="text-xs text-slate-400 truncate">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Products */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Box size={18} className="text-blue-400" />
              Son Məhsullar
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              Hamısı <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/50">
            {stats.loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">Məhsul tapılmadı</p>
              </div>
            ) : (
              recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/edit/${product.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(product.mainImageUrl)}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">{product.brandName || "Avtomir"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{product.price} ₼</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.isInStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.isInStock ? 'Stokda' : 'Yoxdur'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Play size={18} className="text-rose-400" />
              Son Videolar
            </h3>
            <Link
              href="/admin/shorts"
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              Hamısı <ArrowRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/50">
            {stats.loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : recentVideos.length === 0 ? (
              <div className="p-8 text-center">
                <Film size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">Video tapılmadı</p>
              </div>
            ) : (
              recentVideos.map((video) => {
                const youtubeId = getYouTubeId(video.link);
                return (
                  <Link
                    key={video.id}
                    href={`/admin/shorts/edit/${video.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-slate-800/30 transition-colors group"
                  >
                    <div className="w-16 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
                      {youtubeId ? (
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={16} className="text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-rose-300 transition-colors">
                        {video.title}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(video.createdDate).toLocaleDateString("az-AZ")}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${video.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {video.isActive ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Saytınızı izləyin</h3>
            <p className="text-sm text-slate-400">
              Bu dashboard-dan məhsullarınızı, kateqoriyalarınızı və qısa videolarınızı izləyə bilərsiniz.
              Yuxarıdakı statistikalar real vaxtda yenilənir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
