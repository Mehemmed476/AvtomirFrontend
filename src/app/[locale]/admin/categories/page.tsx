"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories, deleteCategory } from "@/lib/api";
import { Category } from "@/types";
import { Edit, Trash2, Plus, Folder, FolderOpen, ChevronRight, Search } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await getCategories();
    if (res?.success) setCategories(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" kateqoriyasını silmək istədiyinizə əminsiniz?`)) return;

    setDeleteLoading(id);
    const res = await deleteCategory(id);
    setDeleteLoading(null);

    if (res?.success) {
      await fetchCategories();
    } else {
      alert("Xəta baş verdi: " + (res?.message || "Kateqoriya silinmədi"));
    }
  };

  // Nested kateqoriyaları flat listə çevirmək (Axtarış üçün)
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = [];
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const renderCategoryRow = (category: Category, level: number = 0, parentId: number | null = null, index: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const indent = level * 28;
    const uniqueKey = `cat-${parentId || 'root'}-${level}-${index}-${category.id}`;

    return (
      <div key={uniqueKey}>
        <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 group">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${indent}px` }}>
            {level > 0 && (
              <ChevronRight size={14} className="text-slate-600 -ml-4" />
            )}
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all
              ${hasChildren
                ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                : level > 0
                  ? "bg-slate-800/50 border border-slate-700/50"
                  : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
              }
            `}>
              {hasChildren ? (
                <FolderOpen className="text-purple-400" size={18} />
              ) : (
                <Folder className={level > 0 ? "text-slate-500" : "text-blue-400"} size={18} />
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-white">{category.name}</span>
              {level > 0 ? (
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Alt Kateqoriya · Səviyyə {level}
                </span>
              ) : hasChildren ? (
                <span className="text-[10px] text-purple-400 font-medium">
                  {category.children!.length} alt kateqoriya
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/admin/categories/edit/${category.id}`}
              className="p-2.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
              title="Redaktə et"
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              disabled={deleteLoading === category.id}
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {hasChildren &&
          category.children!.map((child, idx) => renderCategoryRow(child, level + 1, category.id, idx))
        }
      </div>
    );
  };

  // Count total including nested
  const countAllCategories = (cats: Category[]): number => {
    return cats.reduce((acc, cat) => {
      return acc + 1 + (cat.children ? countAllCategories(cat.children) : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kateqoriyalar</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ümumi {countAllCategories(categories)} kateqoriya tapıldı
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 font-medium"
        >
          <Plus size={20} /> Yeni Kateqoriya
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-800/50">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Kateqoriya axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span className="text-slate-400">Yüklənir...</span>
            </div>
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                <Folder size={24} className="text-slate-600" />
              </div>
              <p className="text-slate-400">Kateqoriya tapılmadı</p>
            </div>
          </div>
        ) : (
          <div>
            {searchTerm ? (
              // Search Mode: Flat List
              flattenCategories(categories)
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .length > 0 ? (
                flattenCategories(categories)
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((category, index) => renderCategoryRow(category, 0, null, index))
              ) : (
                <div className="px-6 py-12 text-center text-slate-400">
                  Heç bir nəticə tapılmadı
                </div>
              )
            ) : (
              // Normal Mode: Tree View
              categories
                .filter(c => c.parentId === null || c.parentId === undefined)
                .map((category, index) => renderCategoryRow(category, 0, null, index))
            )}
          </div>
        )}
      </div>
    </div>
  );
}