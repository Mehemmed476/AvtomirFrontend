"use client";

import { useState, useEffect, use } from "react";
import { getCategories, getProductById, updateProduct, uploadImage, getImageUrl } from "@/lib/api";
import { Category, ProductDetailDto } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState("");

  // Şəkil state-ləri
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [existingMainImageUrl, setExistingMainImageUrl] = useState<string>("");

  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

  // Form state-ləri
  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    categoryIds: [] as number[],
    price: "",
    oldPrice: "",
    shortDescription: "",
    description: "",
    isNew: false,
    isInStock: true,
    isActive: true,
  });

  // Kateqoriyaları və məhsul məlumatlarını yüklə
  useEffect(() => {
    const loadData = async () => {
      // Kateqoriyaları yüklə
      const catRes = await getCategories();
      if (catRes?.success) setCategories(catRes.data);
      setCatLoading(false);

      // Məhsul məlumatlarını yüklə
      const productRes = await getProductById(id);

      console.log("📦 Product Response:", productRes);
      console.log("📦 Success:", productRes?.success);
      console.log("📦 Data:", productRes?.data);

      if (productRes?.success && productRes.data) {
        const p = productRes.data;

        console.log("✅ Məhsul yükləndi:", p);
        console.log("🔍 Bütün field-lər:", Object.keys(p));

        // Backend categoryIds və ya categories array'i dönə bilər
        const categoryIds = p.categoryIds ||
                          (p.categories ? p.categories.map((c: any) => c.id) : []);

        setFormState({
          name: p.name || "",
          sku: p.sku || "",
          categoryIds: categoryIds,
          price: p.price?.toString() || "",
          oldPrice: p.oldPrice?.toString() || "",
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          isNew: p.isNew || false,
          isInStock: p.isInStock !== undefined ? p.isInStock : true,
          isActive: p.isActive !== undefined ? p.isActive : true,
        });

        setExistingMainImageUrl(p.mainImageUrl || "");

        // Backend müxtəlif field adları ilə qaytara bilər
        let galleryUrls: string[] = [];
        if (p.galleryImageUrls && p.galleryImageUrls.length > 0) {
          galleryUrls = p.galleryImageUrls;
        } else if (p.imageUrls && p.imageUrls.length > 0) {
          galleryUrls = p.imageUrls;
        } else if ((p as any).images && Array.isArray((p as any).images)) {
          // images array of objects ola bilər: [{url: "..."}, ...]
          const images = (p as any).images;
          galleryUrls = images.map((img: any) => typeof img === 'string' ? img : img.url || img.imageUrl);
        } else if ((p as any).galleryImages && Array.isArray((p as any).galleryImages)) {
          const images = (p as any).galleryImages;
          galleryUrls = images.map((img: any) => typeof img === 'string' ? img : img.url || img.imageUrl);
        }

        console.log("🖼️ Gallery URLs found:", galleryUrls);
        setExistingGalleryUrls(galleryUrls.filter(Boolean));
      } else {
        console.error("❌ Məhsul yüklənmədi:", {
          productRes,
          success: productRes?.success,
          data: productRes?.data
        });
        setError("Məhsul tapılmadı");
      }

      setPageLoading(false);
    };

    loadData();
  }, [id]);

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
    setExistingMainImageUrl("");
  };

  const removeGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);
  };

  const removeExistingGalleryImage = (index: number) => {
    const newUrls = existingGalleryUrls.filter((_, i) => i !== index);
    setExistingGalleryUrls(newUrls);
  };

  // Nested kateqoriyaları flat listə çevirmək
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

  const handleCategoryToggle = (categoryId: number) => {
    setFormState(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Ana şəkil - yeni şəkil yüklənibsə istifadə et, yoxsa köhnəni saxla
      let finalMainImageUrl = existingMainImageUrl;

      if (mainImage) {
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
        finalMainImageUrl = mainImageUpload.data;
      }

      // Ana şəkil mütləqdir
      if (!finalMainImageUrl) {
        setError("Ana şəkil mütləqdir");
        setLoading(false);
        return;
      }

      // 2. Galeri şəkilləri - yenilərini yüklə və köhnələrlə birləşdir
      const newGalleryUrls: string[] = [];
      for (const image of galleryImages) {
        const upload = await uploadImage(image);
        if (upload.success) {
          newGalleryUrls.push(upload.data);
        }
      }

      const finalGalleryUrls = [...existingGalleryUrls, ...newGalleryUrls];

      // 3. Update data (Backend DTO'da Id field'i var!)
      const productData = {
        id: parseInt(id),  // Backend DTO'da Id mütləqdir
        name: formState.name,
        sku: formState.sku || undefined,
        price: parseFloat(formState.price),
        oldPrice: formState.oldPrice ? parseFloat(formState.oldPrice) : undefined,
        shortDescription: formState.shortDescription,
        description: formState.description || undefined,
        mainImageUrl: finalMainImageUrl,
        galleryImageUrls: finalGalleryUrls,
        categoryIds: formState.categoryIds,
        isNew: formState.isNew,
        isInStock: formState.isInStock,
        isActive: formState.isActive,
      };

      // 4. Məhsulu yenilə
      const res = await updateProduct(parseInt(id), productData);
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

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Məhsulu Redaktə Et</h1>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Kateqoriyalar <span className="text-red-500">*</span></label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto space-y-1">
                  {catLoading ? (
                    <p className="text-sm text-slate-500">Yüklənir...</p>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-slate-500">Kateqoriya tapılmadı</p>
                  ) : (
                    flattenCategories(categories).map((c, index) => (
                      <label
                        key={`edit-cat-${c.id}-${index}`}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors"
                        style={{ paddingLeft: `${8 + c.level * 16}px` }}
                      >
                        <input
                          type="checkbox"
                          checked={formState.categoryIds.includes(c.id)}
                          onChange={() => handleCategoryToggle(c.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {c.level > 0 && "└─ "}{c.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
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

              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input checked={formState.isNew} onChange={(e) => setFormState({...formState, isNew: e.target.checked})} type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Yeni Məhsul</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input checked={formState.isInStock} onChange={(e) => setFormState({...formState, isInStock: e.target.checked})} type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Stokda var</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input checked={formState.isActive} onChange={(e) => setFormState({...formState, isActive: e.target.checked})} type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Aktiv</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ana Şəkil */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ana Şəkil <span className="text-red-500">*</span></label>
                {mainImagePreview || existingMainImageUrl ? (
                  <div className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-blue-400 relative bg-slate-100">
                      <Image src={mainImagePreview || getImageUrl(existingMainImageUrl)} alt="Ana şəkil" fill className="object-contain p-2" />
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
                    {galleryImages.length > 0 ? `${galleryImages.length} yeni şəkil seçildi` : "Yeni şəkillər əlavə edin"}
                  </p>
                </div>
              </div>

              {/* Mövcud Galeri Şəkilləri */}
              {existingGalleryUrls.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Mövcud Galeri Şəkilləri:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingGalleryUrls.map((url, idx) => (
                      <div key={`existing-img-${idx}-${url.substring(url.length - 10)}`} className="relative group">
                        <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-slate-300 relative">
                          <Image src={getImageUrl(url)} alt={`Mövcud ${idx + 1}`} fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingGalleryImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeni Galeri Şəkilləri Önizləmələri */}
              {galleryPreviews.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-2">Yeni Galeri Şəkilləri:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryPreviews.map((preview, idx) => (
                      <div key={`new-img-${idx}-${preview.substring(preview.length - 10)}`} className="relative group">
                        <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-green-400 relative">
                          <Image src={preview} alt={`Yeni ${idx + 1}`} fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">Yeni</span>
                      </div>
                    ))}
                  </div>
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
            {loading ? "Yenilənir..." : "Dəyişiklikləri Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}
