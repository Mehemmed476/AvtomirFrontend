"use client";

import { useEffect, useState } from "react";
import {
  Package, FolderTree, Play, Settings, Plus, ArrowRight, TrendingUp,
  Calendar, Loader2, Box, Film, Sun, Moon, Sunset, Phone, Mail, MapPin,
  ExternalLink, RefreshCw, History, Pencil, Trash2
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { getProducts, getCategories, getShortVideos, getImageUrl, ShortVideoGetDto, getRecentActivity } from "@/lib/api";
import { getSettingsClient } from "@/lib/settings";
import { ProductListDto, Category, Settings as SettingsType, AuditLog } from "@/types";

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
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SettingsType | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setStats(prev => ({ ...prev, loading: true }));
    try {
      const [productsRes, categoriesRes, videosRes, settingsRes, activityRes] = await Promise.all([
        getProducts(1, 5, { sort: 'newest' }),
        getCategories(),
        getShortVideos(),
        getSettingsClient(),
        getRecentActivity(8)
      ]);

      setStats({
        totalProducts: productsRes?.data?.totalCount || 0,
        totalCategories: countAllCategories(categoriesRes?.data || []),
        totalVideos: videosRes?.data?.length || 0,
        loading: false
      });

      setRecentProducts(productsRes?.data?.items || []);
      setRecentVideos((videosRes?.data || []).slice(0, 5));
      setRecentActivity(activityRes);
      setSiteSettings(settingsRes);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

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

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Activity helpers
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Create': return <Plus size={12} className="text-emerald-400" />;
      case 'Update': return <Pencil size={12} className="text-blue-400" />;
      case 'Delete': return <Trash2 size={12} className="text-red-400" />;
      default: return <History size={12} className="text-slate-400" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'Create': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Update': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Delete': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'Create': return 'Yaradıldı';
      case 'Update': return 'Yeniləndi';
      case 'Delete': return 'Silindi';
      default: return type;
    }
  };

  const getTableText = (tableName: string) => {
    switch (tableName) {
      case 'Products': return 'Məhsul';
      case 'Categories': return 'Kateqoriya';
      case 'ShortVideos': return 'Video';
      default: return tableName;
    }
  };

  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'İndicə';
    if (diffMins < 60) return `${diffMins} dəq əvvəl`;
    if (diffHours < 24) return `${diffHours} saat əvvəl`;
    if (diffDays < 7) return `${diffDays} gün əvvəl`;
    return date.toLocaleDateString('az-AZ');
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: "Sabahınız xeyir", icon: Sun, color: "text-amber-400" };
    if (hour >= 12 && hour < 17) return { text: "Günortanız xeyir", icon: Sun, color: "text-orange-400" };
    if (hour >= 17 && hour < 21) return { text: "Axşamınız xeyir", icon: Sunset, color: "text-rose-400" };
    return { text: "Gecəniz xeyir", icon: Moon, color: "text-indigo-400" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Format date in Azerbaijani
  const formatDate = (date: Date) => {
    const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
      description: "Məhsul əlavə et",
      href: "/admin/products/create",
      icon: Plus,
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20 hover:border-blue-500/40"
    },
    {
      title: "Yeni Kateqoriya",
      description: "Kateqoriya yarat",
      href: "/admin/categories/create",
      icon: Plus,
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20 hover:border-purple-500/40"
    },
    {
      title: "Yeni Video",
      description: "Shorts əlavə et",
      href: "/admin/shorts/create",
      icon: Film,
      gradient: "from-rose-500 to-orange-500",
      shadow: "shadow-rose-500/20",
      bgGradient: "from-rose-500/10 to-orange-500/10",
      borderColor: "border-rose-500/20 hover:border-rose-500/40"
    },
    {
      title: "Ayarlar",
      description: "Sayt ayarları",
      href: "/admin/settings",
      icon: Settings,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Greeting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center`}>
              <GreetingIcon size={20} className={greeting.color} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{greeting.text}!</h1>
              <p className="text-slate-400 text-sm">{formatDate(currentTime)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={stats.loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-sm text-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={stats.loading ? 'animate-spin' : ''} />
          Yenilə
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className={`group bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <TrendingUp size={18} className="text-slate-500 group-hover:text-green-400 transition-colors" />
            </div>
            <div>
              {stats.loading ? (
                <div className="h-8 flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              )}
              <p className="text-sm text-slate-400">{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className={`group flex items-center gap-3 p-3 bg-gradient-to-r ${action.bgGradient} border ${action.borderColor} rounded-xl transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className={`w-9 h-9 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center shadow-lg ${action.shadow} flex-shrink-0`}>
              <action.icon size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                {action.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Products - Takes 2 columns */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
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
                  <div className="w-11 h-11 rounded-lg bg-white overflow-hidden flex-shrink-0">
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
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Videos + Site Info */}
        <div className="space-y-6">

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
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : recentVideos.length === 0 ? (
                <div className="p-6 text-center">
                  <Film size={28} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-400 text-sm">Video tapılmadı</p>
                </div>
              ) : (
                recentVideos.slice(0, 3).map((video) => {
                  const youtubeId = getYouTubeId(video.link);
                  return (
                    <Link
                      key={video.id}
                      href={`/admin/shorts/edit/${video.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-slate-800/30 transition-colors group"
                    >
                      <div className="w-14 h-9 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative">
                        {youtubeId ? (
                          <img
                            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play size={14} className="text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-rose-300 transition-colors">
                          {video.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(video.createdDate).toLocaleDateString("az-AZ")}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Site Contact Info */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Settings size={16} className="text-emerald-400" />
                Əlaqə Məlumatları
              </h3>
              <Link
                href="/admin/settings"
                className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                Redaktə <ExternalLink size={10} />
              </Link>
            </div>

            {stats.loading ? (
              <div className="py-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={14} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">Telefon</p>
                    <p className="text-sm text-white truncate">{siteSettings?.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">Email</p>
                    <p className="text-sm text-white truncate">{siteSettings?.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">Ünvan</p>
                    <p className="text-sm text-white truncate">{siteSettings?.address || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <History size={18} className="text-violet-400" />
            Son Dəyişikliklər
          </h3>
        </div>

        <div className="divide-y divide-slate-800/50">
          {stats.loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <History size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm">Dəyişiklik tarixçəsi tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800/30">
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900/50 p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityBadge(log.type)}`}>
                      {getActivityIcon(log.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getActivityBadge(log.type)}`}>
                          {getActivityText(log.type)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {getTableText(log.tableName)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        #{log.primaryKey}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {formatActivityTime(log.dateTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
