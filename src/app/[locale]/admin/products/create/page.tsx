import { useState, useEffect } from "react";
import { getCategories, createProduct, uploadImage, getProducts } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "@/i18n/routing";
import { Save, X, Upload, Loader2, Search } from "lucide-react";
import Image from "next/image";
import CategorySelector from "@/components/admin/CategorySelector";

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
  const [categorySearch, setCategorySearch] = useState("");

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
    videoLink: ""
  });

  useEffect(() => {
    getCategories().then(res => {
      if (res?.success) setCategories(res.data);
      setCatLoading(false);
    });
  }, []);

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

      // 3.0 SKU Avtomatik Generasiya
      let generatedSku = "SKU-10000";
      try {
        const latestProducts = await getProducts(1, 1); // Ən son məhsulu gətiririk
        if (latestProducts?.success && latestProducts.data?.items?.length > 0) {
          const lastSku = latestProducts.data.items[0].sku;
          if (lastSku && lastSku.startsWith("SKU-")) {
            const lastNumber = parseInt(lastSku.replace("SKU-", ""), 10);
            if (!isNaN(lastNumber)) {
              generatedSku = `SKU-${lastNumber + 1}`;
            }
          }
        }
      } catch (err) {
        console.error("SKU generation error:", err);
        // Fallback to default if error
      }

      // 3. Form datanı state-dən topla
      const productData = {
        name: formState.name,
        sku: generatedSku, // Auto-generated SKU
        price: parseFloat(formState.price),
        oldPrice: formState.oldPrice ? parseFloat(formState.oldPrice) : undefined,
        shortDescription: formState.shortDescription,  // REQUIRED
        description: formState.description || undefined,
        mainImageUrl: mainImageUpload.data,
        galleryImageUrls: galleryUrls,
        categoryIds: formState.categoryIds,
        isNew: formState.isNew,
        isInStock: true,
        videoLink: formState.videoLink || undefined
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
        <div>
          <h1 className="text-2xl font-bold text-white">Yeni Məhsul</h1>
          <p className="text-slate-400 text-sm mt-1">Yeni məhsul məlumatlarını daxil edin</p>
        </div>
        <button type="button" onClick={() => router.back()} className="text-slate-400 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all">
          <X size={18} /> Ləğv et
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Məhsul Adı <span className="text-red-400">*</span></label>
                <input value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" placeholder="Məs: BMW M5 Radiator" />
              </div>

              {/* SKU Input Hidden - Auto Generated */}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Video Link</label>
                <input value={formState.videoLink} onChange={(e) => setFormState({ ...formState, videoLink: e.target.value })} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" placeholder="YouTube və ya digər video linki" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kateqoriyalar <span className="text-red-400">*</span></label>

                {/* Custom Category Selector Component */}
                <CategorySelector
                  categories={categories}
                  selectedIds={formState.categoryIds}
                  onChange={(ids) => setFormState({ ...formState, categoryIds: ids })}
                  mode="multiple"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Qiymət (₼) <span className="text-red-400">*</span></label>
                  <input value={formState.price} onChange={(e) => setFormState({ ...formState, price: e.target.value })} type="number" step="0.01" min="0" required className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Köhnə Qiymət (₼)</label>
                  <input value={formState.oldPrice} onChange={(e) => setFormState({ ...formState, oldPrice: e.target.value })} type="number" step="0.01" min="0" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input checked={formState.isNew} onChange={(e) => setFormState({ ...formState, isNew: e.target.checked })} type="checkbox" className="w-5 h-5 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/30" />
                  <span className="text-sm font-medium text-white">Yeni Məhsul</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Ana Şəkil */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ana Şəkil <span className="text-red-400">*</span></label>
                {mainImagePreview ? (
                  <div className="relative group">
                    <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-blue-500/50 relative bg-slate-800/50">
                      <Image src={mainImagePreview} alt="Ana şəkil" fill className="object-contain p-2" />
                    </div>
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={16} />
                    </button>
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-lg font-medium">Ana Şəkil</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleMainImageChange}
                    />
                    <Upload className="mx-auto text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" size={32} />
                    <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Ana şəkli seçin</p>
                  </div>
                )}
              </div>

              {/* Galeri Şəkilləri */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Galeri Şəkilləri (İstəyə görə)</label>
                <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-4 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleGalleryImagesChange}
                  />
                  <Upload className="mx-auto text-slate-500 group-hover:text-emerald-400 mb-1 transition-colors" size={24} />
                  <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    {galleryImages.length > 0 ? `${galleryImages.length} galeri şəkil seçildi` : "Əlavə şəkillər yükləyin"}
                  </p>
                </div>
              </div>

              {/* Galeri önizləmələri */}
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-full h-20 rounded-lg overflow-hidden border-2 border-emerald-500/50 relative">
                        <Image src={preview} alt={`Galeri ${idx + 1}`} fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[10px] px-1.5 rounded font-medium">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Qısa Təsvir <span className="text-red-400">*</span>
            </label>
            <textarea value={formState.shortDescription} onChange={(e) => setFormState({ ...formState, shortDescription: e.target.value })} required rows={2} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all resize-none" placeholder="Məhsul haqqında qısa məlumat" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Təsvir (Description)</label>
            <textarea value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} rows={5} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all resize-none" placeholder="Məhsul haqqında ətraflı məlumat" />
          </div>
        </div>

        <div className="bg-slate-800/30 px-8 py-5 border-t border-slate-800/50 flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors rounded-xl hover:bg-slate-700/50">
            Ləğv et
          </button>
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Yadda saxlanılır..." : "Məhsulu Yadda Saxla"}
          </button>
        </div>
      </form>
    </div>
  );
}