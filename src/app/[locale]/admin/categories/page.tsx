"use client";

import { useEffect, useState, useCallback } from "react";
import { getCategories, deleteCategory } from "@/lib/api";
import { Category } from "@/types";
import { Edit, Trash2, Plus, Folder, FolderOpen } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

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

  // Render Category Rows (Ağac strukturu göstərmək üçün)
  const renderCategoryRow = (category: Category, level: number = 0, parentId: number | null = null, index: number = 0) => {
    // Alt kateqoriyaların olub-olmadığını yoxlayırıq
    const hasChildren = category.children && category.children.length > 0;

    // Hər səviyyə üçün 24px indent (məsafə) qoyuruq
    const indent = level * 24;

    // Unique key yaratmaq üçün parent ID, level və index istifadə edirik
    const uniqueKey = `cat-${parentId || 'root'}-${level}-${index}-${category.id}`;

    return (
      <div key={uniqueKey}>
        <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors border-b border-slate-100">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${indent}px` }}>
            {hasChildren ? (
              <FolderOpen className="text-blue-500" size={20} />
            ) : (
              <Folder className="text-slate-400" size={20} />
            )}
            
            <div className="flex flex-col">
              <span className="font-semibold text-slate-700">{category.name}</span>
              {category.parentId && (
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Alt Kateqoriya
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/admin/categories/edit/${category.id}`}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              title="Redaktə et"
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              disabled={deleteLoading === category.id}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 rounded-lg hover:bg-red-50"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* REKURSİV ÇAĞIRIŞ:
           Əgər alt kateqoriyalar varsa, funksiya özünü yenidən çağırır (level + 1 ilə)
        */}
        {hasChildren &&
          category.children!.map((child, index) => renderCategoryRow(child, level + 1, category.id, index))
        }
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kateqoriyalar</h1>
          <p className="text-slate-500 text-sm">Ümumi {categories.length} kateqoriya tapıldı.</p>
        </div>
        <Link
          href="/admin/categories/create"
          className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={20} /> Yeni Kateqoriya
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-slate-400">Yüklənir...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400">Kateqoriya tapılmadı</div>
        ) : (
          <div>
            {categories
              .filter(c => c.parentId === null || c.parentId === undefined) // Yalnız Ana kateqoriyalardan başla
              .map((category, index) => renderCategoryRow(category, 0, null, index))
            }
          </div>
        )}
      </div>
    </div>
  );
}
