import { getProductBySlug, getImageUrl } from '@/lib/api';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/ProductGallery';
import { Check, ShieldCheck, Truck, MessageCircle, ShoppingCart, Info, Package, PlayCircle } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('Product'); // Tərcümələri yüklə
  const tCommon = await getTranslations('Common');

  // API-dən məhsulu çək
  const response = await getProductBySlug(slug);
  const product = response?.data;

  // DEBUG LOGS
  console.log("🔍 [ProductDetail] Slug:", slug);
  console.log("🔍 [ProductDetail] Product Data:", JSON.stringify(product, null, 2));
  if (product) {
    console.log("🔍 [ProductDetail] Keys:", Object.keys(product));
    console.log("🔍 [ProductDetail] videoLink:", product.videoLink);
    // Check for case sensitivity issues
    console.log("🔍 [ProductDetail] VideoLink:", (product as any).VideoLink);

    // Normalization incase backend returns PascalCase
    if (!product.videoLink && (product as any).VideoLink) {
      product.videoLink = (product as any).VideoLink;
    }
  }

  // Əgər məhsul tapılmasa 404 səhifəsinə at
  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-8 pb-20">
      <div className="container mx-auto px-4">

        {/* BREADCRUMB (Naviqasiya Yolu) */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Mağaza</Link>
          <span>/</span>
          <span className="text-gray-300 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* MƏHSUL BLOKU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* SOL TƏRƏF: Qalereya */}
          <div>
            <ProductGallery
              mainImage={product.mainImageUrl}
              images={product.imageUrls || []} //
            />
          </div>

          {/* SAĞ TƏRƏF: Məlumatlar */}
          <div className="space-y-8">

            {/* Başlıq və Qiymət */}
            <div className="space-y-4 pb-8 border-b border-dark-700">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

              <div className="flex items-center gap-4">
                {product.brandName && (
                  <span className="bg-dark-800 text-gray-300 px-3 py-1 rounded text-sm font-medium border border-dark-600">
                    Brend: <span className="text-white">{product.brandName}</span>
                  </span>
                )}

                {/* SKU */}
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Package size={14} /> Kod: {product.sku || "N/A"}
                </span>
              </div>

              <div className="flex items-end gap-4 mt-4">
                <span className="text-4xl font-bold text-primary">{product.price} ₼</span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-500 line-through mb-1 decoration-red-500">{product.oldPrice} ₼</span>
                )}
                {product.discountRate > 0 && (
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold mb-2">
                    -{product.discountRate}% ENDİRİM
                  </span>
                )}
              </div>
            </div>

            {/* Stok və Qısa Məlumat */}
            <div className="space-y-4">
              {product.isInStock ? (
                <div className="flex items-center gap-2 text-green-400 font-medium bg-green-400/10 w-fit px-4 py-2 rounded-lg border border-green-400/20">
                  <Check size={18} /> Stokda var
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400 font-medium bg-red-400/10 w-fit px-4 py-2 rounded-lg border border-red-400/20">
                  <Info size={18} /> Hazırda bitib
                </div>
              )}

              <p className="text-gray-400 leading-relaxed">
                {product.shortDescription || "Bu məhsul üçün qısa məlumat yoxdur."}
              </p>

              {product.videoLink && (
                <div className="pt-2">
                  <a
                    href={product.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-medium border border-red-500/30 bg-red-500/10 px-4 py-2 rounded-lg"
                  >
                    <PlayCircle size={20} />
                    <span>Məhsul Videosunu İzlə</span>
                  </a>
                </div>
              )}
            </div>

            {/* DÜYMƏLƏR */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!product.isInStock}
              >
                <ShoppingCart size={20} /> Səbətə At
              </button>

              {/* WhatsApp Link */}
              {product.whatsAppLink && (
                <a
                  href={product.whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
                >
                  <MessageCircle size={20} /> WhatsApp-la Al
                </a>
              )}
            </div>

            {/* Avantajlar */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck size={20} className="text-primary" /> Rəsmi Zəmanət
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Truck size={20} className="text-primary" /> Sürətli Çatdırılma
              </div>
            </div>

          </div>
        </div>

        {/* TƏSVİR VƏ DETALLAR TAB-ı */}
        <div className="mt-20">
          <div className="border-b border-dark-700 mb-8">
            <button className="text-white font-bold text-lg border-b-2 border-primary pb-4 px-4">
              Məhsul Haqqında
            </button>
          </div>

          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700 text-gray-300 leading-relaxed space-y-4">
            {/* HTML kontent varsa onu render etmək olar, hələlik sadə text */}
            <div dangerouslySetInnerHTML={{ __html: product.description || "<p>Ətraflı məlumat yoxdur.</p>" }} />
          </div>
        </div>

      </div>
    </main>
  );
}