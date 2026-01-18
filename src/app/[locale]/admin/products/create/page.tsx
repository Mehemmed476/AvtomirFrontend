"use client";

import { useState, useEffect } from "react";
import { getCategories, createProduct, uploadImage } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Form state-ləri
  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    brandId: "",  // DEĞİŞTİ: brandName (string) → brandId (number)
    categoryId: "",
    price: "",
    oldPrice: "",
    shortDescription: "",
    description: "",
    isNew: false
  });

  useEffect(() => {
    getCategories().then(res => {
      if (res?.success) setCategories(res.data);
      setCatLoading(false);
    });
  }, []);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const removeMainImage = () => {
    setMainImage(null);
    setMainImagePreview("");
  };

  const removeGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Ana şəkili yüklə
      if (!mainImage) {
        setError("Ana şəkil mütləqdir");
        setLoading(false);
        return;
      }

      const mainImageUpload = await uploadImage(mainImage);
      if (!mainImageUpload.success) {
        if (mainImageUpload.statusCode === 401) {
          setError("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else {
          setError("Ana şəkil yüklənmədi: " + mainImageUpload.message);
        }
        setLoading(false);
        return;
      }

      // 2. Galeri şəkillərini yüklə
      const galleryUrls: string[] = [];
      for (const image of galleryImages) {
        const upload = await uploadImage(image);
        if (upload.success) {
          galleryUrls.push(upload.data);
        }
      }

      // 3. Form datanı state-dən topla
      const productData = {
        name: formState.name,
        sku: formState.sku || undefined,
        brandId: formState.brandId ? parseInt(formState.brandId) : undefined,
        price: parseFloat(formState.price),
        oldPrice: formState.oldPrice ? parseFloat(formState.oldPrice) : undefined,
        shortDescription: formState.shortDescription,  // REQUIRED
        description: formState.description || undefined,
        mainImageUrl: mainImageUpload.data,
        galleryImageUrls: galleryUrls,  // DEĞİŞTİ: Her zaman array
        categoryIds: formState.categoryId ? [parseInt(formState.categoryId)] : [],  // DEĞİŞTİ: Array
        isNew: formState.isNew,
        isInStock: true
      };

      // 4. Məhsulu yarat
      const res = await createProduct(productData);
      setLoading(false);

      if (res.success) {
        router.push("/admin/products");
      } else {
        if (res.statusCode === 401) {
          setError("Sizin sessiya bitib. Zəhmət olmasa yenidən login olun.");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else {
          const errorMsg = res.errors?.join(", ") || res.message || "Xəta baş verdi";
          setError(errorMsg);
        }
      }
    } catch (err) {
      setLoading(false);
      setError("Gözlənilməz xəta: " + (err as Error).message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Yeni Məhsul</h1>
        <button type="button" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Məhsul Adı <span className="text-red-500">*</span></label>
                <input value={formState.name} onChange={(e) => setFormState({...formState, name: e.target.value})} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Məs: BMW M5 Radiator" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">SKU / Məhsul Kodu</label>
                <input value={formState.sku} onChange={(e) => setFormState({...formState, sku: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Məs: BMW-RAD-001" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Brend ID (istəyə görə)</label>
                <input value={formState.brandId} onChange={(e) => setFormState({...formState, brandId: e.target.value})} type="number" min="1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Brend ID daxil edin" />
                <p className="text-xs text-slate-500 mt-1">Brend ID-ni backend-dən əldə etməlisiniz</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kateqoriya <span className="text-red-500">*</span></label>
                <select value={formState.categoryId} onChange={(e) => setFormState({...formState, categoryId: e.target.value})} required disabled={catLoading} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50">
                  <option value="">Kateqoriya seçin</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Qiymət (₼) <span className="text-red-500">*</span></label>
                  <input value={formState.price} onChange={(e) => setFormState({...formState, price: e.target.value})} type="number" step="0.01" min="0" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Köhnə Qiymət (₼)</label>
                  <input value={formState.oldPrice} onChange={(e) => setFormState({...formState, oldPrice: e.target.value})} type="number" step="0.01" min="0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input checked={formState.isNew} onChange={(e) => setFormState({...formState, isNew: e.target.checked})} type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Yeni Məhsul</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ana Şəkil */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ana Şəkil <span className="text-red-500">*</span></label>
                {mainImagePreview ? (
                  <div className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-blue-400 relative bg-slate-100">
                      <Image src={mainImagePreview} alt="Ana şəkil" fill className="object-contain p-2" />
                    </div>
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={16} />
                    </button>
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Ana Şəkil</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleMainImageChange}
                    />
                    <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-sm text-slate-500">Ana şəkli seçin</p>
                  </div>
                )}
              </div>

              {/* Galeri Şəkilləri */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Galeri Şəkilləri (İstəyə görə)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-green-400 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleGalleryImagesChange}
                  />
                  <Upload className="mx-auto text-slate-400 mb-1" size={24} />
                  <p className="text-xs text-slate-500">
                    {galleryImages.length > 0 ? `${galleryImages.length} galeri şəkil seçildi` : "Əlavə şəkillər yükləyin"}
                  </p>
                </div>
              </div>

              {/* Galeri önizləmələri */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-green-400 relative">
                        <Image src={preview} alt={`Galeri ${idx + 1}`} fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Qısa Təsvir <span className="text-red-500">*</span>
            </label>
            <textarea value={formState.shortDescription} onChange={(e) => setFormState({...formState, shortDescription: e.target.value})} required rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Məhsul haqqında qısa məlumat" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Təsvir (Description)</label>
            <textarea value={formState.description} onChange={(e) => setFormState({...formState, description: e.target.value})} rows={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Məhsul haqqında ətraflı məlumat" />
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors">
            Ləğv et
          </button>
          <button type="submit" disabled={loading} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Yadda saxlanılır..." : "Məhsulu Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}