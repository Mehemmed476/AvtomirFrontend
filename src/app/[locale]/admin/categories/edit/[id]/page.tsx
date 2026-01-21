"use client";

import { useState, useEffect, use, useRef } from "react";
import { getCategories, getCategoryById, updateCategory } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Loader2, History } from "lucide-react";
import HistoryModal from "@/components/admin/HistoryModal";
import CategorySelector from "@/components/admin/CategorySelector";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      const [catRes, currentCat] = await Promise.all([
        getCategories(),
        getCategoryById(parseInt(id))
      ]);

      if (catRes?.success) {
        setCategories(catRes.data);
      }
      if (currentCat?.success) {
        setCategory(currentCat.data);
        setSelectedParentId(currentCat.data.parentId?.toString() || "");
      }
      setLoading(false);
    }
    loadData();
  }, [id]);





  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const categoryData = {
        id: parseInt(id),
        name: formData.get("name") as string,
        description: (formData.get("description") as string),
        parentId: selectedParentId ? parseInt(selectedParentId) : null
      };

      const res = await updateCategory(parseInt(id), categoryData);
      setSubmitLoading(false);

      if (res.success) {
        // res.data artık boolean (true/false) qaytarır
        router.push("/admin/categories");
      } else {
        if (res.statusCode === 401) {
          setError("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else {
          setError(res.message || "Xəta baş verdi");
        }
      }
    } catch (err) {
      setSubmitLoading(false);
      setError("Gözlənilməz xəta: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-slate-400">Yüklənir...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Kateqoriya tapılmadı!</h2>
          <p className="text-slate-400 mb-4">Bu ID-yə uyğun kateqoriya mövcud deyil.</p>
          <button onClick={() => router.back()} className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kateqoriyanı Redaktə Et</h1>
          <p className="text-slate-400 text-sm mt-1">ID: {category.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryModalOpen(true)}
            className="text-slate-400 hover:text-violet-400 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-violet-500/10 transition-all border border-transparent hover:border-violet-500/20"
          >
            <History size={18} /> Tarixçə
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
          >
            <X size={18} /> Ləğv et
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kateqoriya Adı <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              defaultValue={category.name}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition-all"
              placeholder="Məs: Mühərrik Hissələri"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Təsvir (İstəyə görə)
            </label>
            <textarea
              name="description"
              defaultValue={category.description}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition-all resize-none"
              placeholder="Kateqoriya haqqında qısa məlumat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ana Kateqoriya (İstəyə görə)
            </label>
            <CategorySelector
              categories={categories}
              selectedIds={selectedParentId ? [Number(selectedParentId)] : []}
              onChange={(ids) => {
                const newId = ids.length > 0 ? ids[0].toString() : "";
                setSelectedParentId(newId);
              }}
              mode="single"
              excludeId={parseInt(id)}
            />
            <p className="text-xs text-slate-500 mt-2">
              Əgər alt kateqoriya kimi dəyişmək istəyirsinizsə, ana kateqoriyanı seçin.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/30 px-8 py-5 border-t border-slate-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors rounded-xl hover:bg-slate-700/50"
          >
            Ləğv et
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {submitLoading ? "Yadda saxlanılır..." : "Dəyişiklikləri Yadda Saxla"}
          </button>
        </div>
      </form>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        tableName="Categories"
        recordId={id}
        title="Kateqoriya Tarixçəsi"
      />
    </div>
  );
}
