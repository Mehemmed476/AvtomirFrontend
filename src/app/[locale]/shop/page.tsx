import { getTranslations } from 'next-intl/server';
import { getProducts, getCategories } from '@/lib/api';
import Pagination from '@/components/Pagination';
import ShopSidebar from '@/components/ShopSidebar';
import ShopToolbar from '@/components/ShopToolbar';
import { ShoppingCart, Eye, Search, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const t = await getTranslations('Shop');
  
  // 1. URL-dən parametrləri oxuyuruq
  const resolvedParams = await searchParams;
  const pageNumber = Number(resolvedParams.pageNumber) || 1;
  const searchQuery = resolvedParams.search as string || "";
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort as string || "";
  const categoryId = resolvedParams.categoryId ? Number(resolvedParams.categoryId) : undefined;

  // 2. PARALEL FETCHING: Eyni anda həm Məhsulları, həm də Kateqoriyaları çağırırıq
  const productsData = getProducts({
    pageNumber,
    pageSize: 12,
    search: searchQuery,
    minPrice,
    maxPrice,
    sort,
    categoryId
  });

  const categoriesData = getCategories();

  // Cavabları gözləyirik
  const [productsRes, categoriesRes] = await Promise.all([productsData, categoriesData]);

  // Datanı çıxarırıq
  const products = productsRes?.data?.items || [];
  const categories = categoriesRes?.data || [];
  
  const metaData = productsRes?.data ? {
    currentPage: productsRes.data.currentPage,
    totalPages: productsRes.data.totalPages,
    totalCount: productsRes.data.totalCount
  } : { currentPage: 1, totalPages: 1, totalCount: 0 };

  // Şəkil URL düzəldən Helper
  const getImageUrl = (url: string) => {
    if (!url || url === 'no-image.png') return '/assets/no-image.png';
    if (url.startsWith('http')) return url;
    return `http://45.67.203.108:8080/uploads/${url}`;
  };

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-8 pb-20 px-4">
      <div className="container mx-auto">
        
        {/* Layout: Sol (Sidebar) + Sağ (Məzmun) */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR (Desktopda görünür) */}
          <aside className="w-full lg:w-1/4 hidden lg:block h-fit sticky top-24">
            <ShopSidebar categories={categories} />
          </aside>

          {/* MƏZMUN HİSSƏSİ */}
          <section className="w-full lg:w-3/4">
            
            {/* Toolbar (Search & Sort) */}
            <ShopToolbar totalCount={metaData.totalCount} categories={categories} />

            {/* Məhsullar Grid-i */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((item) => (
                    <div key={item.id} className="group bg-dark-800 rounded-2xl p-4 border border-dark-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 relative flex flex-col">
                      
                      {/* --- ETIKETLƏR --- */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {/* Endirim */}
                        {item.discountRate > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                            -{item.discountRate}%
                          </span>
                        )}
                        {/* Yeni */}
                        {item.isNew && (
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                            YENİ
                          </span>
                        )}
                      </div>

                      {/* --- ŞƏKİL --- */}
                      <div className="aspect-[4/3] bg-white rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
                        <img 
                          src={getImageUrl(item.mainImageUrl)} 
                          alt={item.name}
                          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                                                
                      </div>

                      {/* --- MƏLUMATLAR --- */}
                      <div className="space-y-3 flex-1 flex flex-col">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                             </p>
                             {/* Stok Statusu */}
                             {item.isInStock ? (
                               <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">Stokda</span>
                             ) : (
                               <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">Bitib</span>
                             )}
                          </div>
                          
                          <Link href={`/product/${item.slug}`} className="block">
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 h-12" title={item.name}>
                              {item.name}
                            </h3>
                          </Link>
                        </div>
                        
                        {/* Qiymət və Səbət */}
                        <div className="flex items-end justify-between pt-3 border-t border-dark-600 mt-auto">
                          <div className="flex flex-col">
                            {item.oldPrice && (
                              <span className="text-sm text-gray-500 line-through decoration-red-500 decoration-2 font-medium">
                                {item.oldPrice} ₼
                              </span>
                            )}
                            <span className="text-2xl font-bold text-primary tracking-tight">{item.price} <span className="text-sm align-top">₼</span></span>
                          </div>
                          
                          <button className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-95 shadow-lg border border-dark-600 hover:border-primary">
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* --- PAGINATION --- */}
                <div className="mt-12">
                   <Pagination 
                     currentPage={metaData.currentPage} 
                     totalPages={metaData.totalPages} 
                   />
                </div>
              </>
            ) : (
              // --- MƏHSUL TAPILMADIQDA ---
              <div className="flex flex-col items-center justify-center py-32 bg-dark-800 rounded-3xl border border-dark-700 border-dashed">
                <div className="bg-dark-700 p-6 rounded-full mb-6 animate-pulse">
                  <Search size={48} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Təəssüf, heç nə tapılmadı 😕</h2>
                <p className="text-gray-400 max-w-md mx-auto text-center mb-6">
                  Axtarış sözünü dəyişdirin və ya filtrləri təmizləyib yenidən yoxlayın.
                </p>
                <Link href="/shop" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium">
                  Bütün Məhsullar
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}