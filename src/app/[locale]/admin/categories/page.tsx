"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories, deleteCategory, bulkDeleteCategories, getCategoryProductCounts } from "@/lib/api";
import { Category } from "@/types";
import { Edit, Trash2, Plus, Folder, FolderOpen, ChevronRight, ChevronDown, Search, ChevronsUpDown, Package, CheckSquare, Square } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useConfirm } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const confirm = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<number, number>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Tüm parent kategorilerin ID'lerini al (children olanlar)
  const getAllParentIds = useCallback((cats: Category[]): number[] => {
    let ids: number[] = [];
    for (const cat of cats) {
      if (cat.children && cat.children.length > 0) {
        ids.push(cat.id);
        ids = ids.concat(getAllParentIds(cat.children));
      }
    }
    return ids;
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const [res, countsRes] = await Promise.all([
      getCategories(),
      getCategoryProductCounts()
    ]);
    if (res?.success) {
      setCategories(res.data);
      // Varsayılan olarak tüm kategorileri aç
      const parentIds = getAllParentIds(res.data);
      setExpandedCategories(new Set(parentIds));
      setAllExpanded(true);
    }
    if (countsRes) {
      setProductCounts(countsRes);
    }
    setLoading(false);
  }, [getAllParentIds]);

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllCategories = () => {
    if (allExpanded) {
      // Hepsini kapat
      setExpandedCategories(new Set());
      setAllExpanded(false);
    } else {
      // Hepsini aç
      const parentIds = getAllParentIds(categories);
      setExpandedCategories(new Set(parentIds));
      setAllExpanded(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: "Kateqoriyanı sil",
      message: `"${name}" kateqoriyasını silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: "Sil",
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setDeleteLoading(id);
    const res = await deleteCategory(id);
    setDeleteLoading(null);

    if (res?.success) {
      toast.success("Kateqoriya uğurla silindi");
      await fetchCategories();
    } else {
      toast.error("Xəta baş verdi: " + (res?.message || "Kateqoriya silinmədi"));
    }
  };

  // Bulk delete handlers
  const toggleSelectCategory = (id: number) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Bütün kategori ID-lərini al
  const getAllCategoryIds = (cats: Category[]): number[] => {
    let ids: number[] = [];
    for (const cat of cats) {
      ids.push(cat.id);
      if (cat.children && cat.children.length > 0) {
        ids = ids.concat(getAllCategoryIds(cat.children));
      }
    }
    return ids;
  };

  const toggleSelectAll = () => {
    const allIds = getAllCategoryIds(categories);
    if (selectedCategories.size === allIds.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(allIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return;

    const confirmed = await confirm({
      title: "Çoxlu silmə",
      message: `${selectedCategories.size} kateqoriyanı silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: `${selectedCategories.size} kateqoriyanı sil`,
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setBulkDeleteLoading(true);
    const res = await bulkDeleteCategories(Array.from(selectedCategories));
    setBulkDeleteLoading(false);

    if (res?.success) {
      toast.success(`${res.data} kateqoriya uğurla silindi`);
      setSelectedCategories(new Set());
      await fetchCategories();
    } else {
      toast.error("Xəta baş verdi: " + (res?.message || "Kateqoriyalar silinmədi"));
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
    const isExpanded = expandedCategories.has(category.id);
    const indent = level * 28;
    const uniqueKey = `cat-${parentId || 'root'}-${level}-${index}-${category.id}`;

    return (
      <div key={uniqueKey}>
        <div className={`flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors border-b border-slate-800/50 group ${selectedCategories.has(category.id) ? 'bg-purple-500/10' : ''}`}>
          <div className="flex items-center gap-3" style={{ paddingLeft: `${indent}px` }}>
            {/* Checkbox */}
            <button
              onClick={() => toggleSelectCategory(category.id)}
              className="p-1 text-slate-400 hover:text-white transition-colors -ml-2"
            >
              {selectedCategories.has(category.id) ? (
                <CheckSquare size={20} className="text-purple-400" />
              ) : (
                <Square size={20} />
              )}
            </button>
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-1 -ml-2 hover:bg-slate-700/50 rounded-lg transition-all"
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-purple-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-500" />
                )}
              </button>
            ) : level > 0 ? (
              <ChevronRight size={14} className="text-slate-600 -ml-4" />
            ) : null}
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
                isExpanded ? (
                  <FolderOpen className="text-purple-400" size={18} />
                ) : (
                  <Folder className="text-purple-400" size={18} />
                )
              ) : (
                <Folder className={level > 0 ? "text-slate-500" : "text-blue-400"} size={18} />
              )}
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-white">{category.name}</span>
              <div className="flex items-center gap-2">
                {level > 0 ? (
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    Alt Kateqoriya · Səviyyə {level}
                  </span>
                ) : hasChildren ? (
                  <span className="text-[10px] text-purple-400 font-medium">
                    {category.children!.length} alt kateqoriya
                  </span>
                ) : null}
                {productCounts[category.id] !== undefined && productCounts[category.id] > 0 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md font-medium">
                    {productCounts[category.id]} məhsul
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {productCounts[category.id] !== undefined && productCounts[category.id] > 0 && (
              <Link
                href={`/admin/products?categoryId=${category.id}`}
                className="p-2.5 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                title="Məhsullara bax"
              >
                <Package size={18} />
              </Link>
            )}
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

        {hasChildren && isExpanded &&
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
        <div className="flex items-center gap-3">
          {selectedCategories.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 font-medium disabled:opacity-50"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Silinir...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  {selectedCategories.size} kateqoriyanı sil
                </>
              )}
            </button>
          )}
          <Link
            href="/admin/categories/create"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25 font-medium"
          >
            <Plus size={20} /> Yeni Kateqoriya
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-800/50">
        {/* Select All Checkbox */}
        <button
          onClick={toggleSelectAll}
          className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
          title={selectedCategories.size === getAllCategoryIds(categories).length ? "Hamısını seçmə" : "Hamısını seç"}
        >
          {categories.length > 0 && selectedCategories.size === getAllCategoryIds(categories).length ? (
            <CheckSquare size={22} className="text-purple-400" />
          ) : (
            <Square size={22} />
          )}
        </button>
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
        <button
          onClick={toggleAllCategories}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all whitespace-nowrap"
          title={allExpanded ? "Hamısını Bağla" : "Hamısını Aç"}
        >
          <ChevronsUpDown size={18} />
          <span className="text-sm font-medium">
            {allExpanded ? "Hamısını Bağla" : "Hamısını Aç"}
          </span>
        </button>
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