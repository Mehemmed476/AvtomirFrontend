"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Loader2 } from "lucide-react";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formState, setFormState] = useState({
    name: "",
    description: "",
    parentId: ""
  });

  useEffect(() => {
    getCategories().then(res => {
      if (res?.success) setCategories(res.data);
      setCatLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Parent ID Məntiqi:
      // Əgər boşdursa (""), Backend-ə null göndəririk.
      // Əgər doludursa, rəqəmə çeviririk.
      const parentIdValue = formState.parentId && formState.parentId !== "" 
          ? Number(formState.parentId) 
          : null;

      // 2. Data Hazırlığı:
      const categoryData = {
        name: formState.name,
        // DİQQƏT: Backend 'string' istədiyi üçün, boşdursa "" (boş string) göndəririk.
        // 'undefined' göndərsək xəta verəcək.
        description: formState.description || "", 
        parentId: parentIdValue
      };

      console.log("Göndərilən Data:", categoryData); 

      const res = await createCategory(categoryData);
      setLoading(false);

      if (res.success) {
        router.push("/admin/categories");
        router.refresh(); 
      } else {
        if (res.statusCode === 401) {
          setError("Sessiya bitib. Yenidən daxil olun.");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else {
          // Xətaları göstər
          const errorMsg = res.errors 
            ? Object.values(res.errors).flat().join(", ") 
            : res.message || "Xəta baş verdi";
          setError(errorMsg);
        }
      }
    } catch (err) {
      setLoading(false);
      setError("Gözlənilməz xəta: " + (err as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Yeni Kateqoriya</h1>
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
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
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
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
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
              value={formState.parentId}
              onChange={(e) => setFormState({ ...formState, parentId: e.target.value })}
              disabled={catLoading}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            >
              <option value="">Əsas Kateqoriya (Parent yoxdur)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Əgər alt kateqoriya yaratmaq istəyirsinizsə, ana kateqoriyanı seçin.
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
            disabled={loading}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Yadda saxlanılır..." : "Kateqoriya Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}
