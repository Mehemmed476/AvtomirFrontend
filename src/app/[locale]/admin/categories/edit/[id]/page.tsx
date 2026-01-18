"use client";

import { useState, useEffect, use } from "react";
import { getCategories, getCategoryById, updateCategory } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Loader2 } from "lucide-react";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [catRes, currentCat] = await Promise.all([
        getCategories(),
        getCategoryById(parseInt(id))
      ]);

      if (catRes?.success) {
        // Özünü parent kimi seçməsinə icazə vermə
        const filtered = catRes.data.filter(c => c.id !== parseInt(id));
        setCategories(filtered);
      }
      if (currentCat?.success) setCategory(currentCat.data);
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

      const parentIdValue = formData.get("parentId") as string;

      const categoryData = {
        id: parseInt(id),
        name: formData.get("name") as string,
        description: (formData.get("description") as string),
        parentId: parentIdValue ? parseInt(parentIdValue) : null
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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-slate-500">Məlumatlar yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Kateqoriya tapılmadı!</h2>
          <p className="text-slate-500 mb-4">Bu ID-yə uyğun kateqoriya mövcud deyil.</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline">
            Geri qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kateqoriyanı Redaktə Et</h1>
          <p className="text-slate-500 text-sm mt-1">ID: {category.id}</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          <X size={20} /> Ləğv et
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Kateqoriya Adı <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              defaultValue={category.name}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="Məs: Mühərrik Hissələri"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Təsvir (İstəyə görə)
            </label>
            <textarea
              name="description"
              defaultValue={category.description}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="Kateqoriya haqqında qısa məlumat"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Ana Kateqoriya (İstəyə görə)
            </label>
            <select
              name="parentId"
              defaultValue={category.parentId || ""}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Əsas Kateqoriya (Parent yoxdur)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Əgər alt kateqoriya kimi dəyişmək istəyirsinizsə, ana kateqoriyanı seçin.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Ləğv et
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {submitLoading ? "Yadda saxlanılır..." : "Dəyişiklikləri Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}
