"use client";

import { useState, useEffect, use } from "react";
import { getCategories, getProductById, updateProduct } from "@/lib/api"; // getProductById funksiyanın olduğunu fərz edirik
import { Category, ProductDetailDto } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    async function loadData() {
      const [catRes, prodRes] = await Promise.all([
        getCategories(),
        getProductById(id) // Backend-dən gələn ID ilə məhsulu gətiririk
      ]);

      if (catRes?.success) setCategories(catRes.data);
      if (prodRes?.success) setProduct(prodRes.data);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = new FormData(e.currentTarget);
    // Yeni yüklənən şəkilləri əlavə edirik
    newImages.forEach(img => formData.append("Images", img));

    const res = await updateProduct(id, formData);
    setSubmitLoading(false);

    if (res.success) {
      router.push("/admin/products");
    } else {
      alert("Xəta: " + res.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Məlumatlar yüklənir...</div>;
  if (!product) return <div className="p-10 text-center text-red-500">Məhsul tapılmadı!</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Məhsulu Redaktə Et</h1>
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
                <input name="Name" defaultValue={product.name} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kateqoriya</label>
                <select name="CategoryId" defaultValue={product.categories?.[0]?.id} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Qiymət (₼)</label>
                  <input name="Price" type="number" step="0.01" defaultValue={product.price} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stok Sayı</label>
                  <input name="StockQuantity" type="number" defaultValue={product.stockQuantity} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>
            </div>

            {/* Şəkil Hissəsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mövcud Şəkil</label>
              <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
                {product.mainImageUrl ? (
                  <Image src={product.mainImageUrl} alt={product.name} fill className="object-contain" />
                ) : <ImageIcon className="m-auto text-slate-300 mt-12" size={40} />}
              </div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Yeni Şəkil Əlavə Et</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 relative">
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                />
                <Upload className="mx-auto text-slate-400 mb-1" size={24} />
                <p className="text-xs text-slate-500">{newImages.length > 0 ? `${newImages.length} yeni şəkil seçildi` : "Dəyişmək üçün klikləyin"}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Qısa Təsvir</label>
            <textarea name="ShortDescription" defaultValue={product.shortDescription} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tam Təsvir</label>
            <textarea name="Description" defaultValue={product.description} rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
          <label className="flex items-center gap-2 mr-auto text-sm font-medium text-slate-600">
            <input type="checkbox" name="IsInStock" defaultChecked={product.isInStock} className="w-4 h-4 text-blue-600 rounded" />
            Stokda var
          </label>
          <button disabled={submitLoading} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70">
            {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Dəyişiklikləri Yadda Saxla
          </button>
        </div>
      </form>
    </div>
  );
}