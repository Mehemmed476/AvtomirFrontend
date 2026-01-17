"use client";

import { useState, useEffect } from "react";
import { getCategories, createProduct } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Upload, Loader2 } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    getCategories().then(res => { if (res?.success) setCategories(res.data); });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // Şəkilləri əlavə edirik
    images.forEach(img => formData.append("Images", img));

    const res = await createProduct(formData);
    setLoading(false);

    if (res.success) {
      router.push("/admin/products");
    } else {
      alert("Xəta baş verdi: " + res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Yeni Məhsul</h1>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 flex items-center gap-1">
          <X size={20} /> Ləğv et
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Məhsul Adı</label>
                <input name="Title" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Məs: BMW M5 Radiator" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kateqoriya</label>
                <select name="CategoryId" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Qiymət (₼)</label>
                  <input name="Price" type="number" step="0.01" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stok Sayı</label>
                  <input name="Stock" type="number" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Şəkillər</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-all cursor-pointer relative">
                <input 
                  type="file" multiple accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                />
                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-500">{images.length > 0 ? `${images.length} şəkil seçildi` : "Şəkilləri bura sürükləyin və ya klikləyin"}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Təsvir (Description)</label>
            <textarea name="Description" rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end">
          <button disabled={loading} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Məhsulu Yadda Saxla
          </button>
        </div>
      </form>
    </div>
  );
}