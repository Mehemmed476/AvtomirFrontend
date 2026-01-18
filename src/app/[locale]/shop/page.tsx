import { getTranslations } from 'next-intl/server';
import { getProducts, getCategories } from '@/lib/api';
import Pagination from '@/components/Pagination';
import ShopSidebar from '@/components/ShopSidebar';
import ShopToolbar from '@/components/ShopToolbar';
import ShopProductList from '@/components/ShopProductList';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/routing';

// Force dynamic rendering - ensures page re-renders on URL param changes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const t = await getTranslations('Shop');

  // 1. URL-dən bütün parametrləri oxuyuruq (search, filter, sort, pagination)
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const pageSize = 12;

  // Filterlər
  const search = resolvedParams.search?.toString();
  const categoryId = resolvedParams.categoryId ? Number(resolvedParams.categoryId) : undefined;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort?.toString();

  // Debug: Log filter parameters
  console.log('🔍 Shop Page Filters:', {
    page,
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort
  });

  // 2. PARALEL FETCHING: Eyni anda həm Məhsulları, həm də Kateqoriyaları çağırırıq
  const productsData = getProducts(page, pageSize, {
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort,
  });
  const categoriesData = getCategories();

  // Cavabları gözləyirik
  const [productsRes, categoriesRes] = await Promise.all([productsData, categoriesData]);

  // Datanı çıxarırıq (Backend artiq direkt array qaytarır)
  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];

  // Extract total count from backend response (if available)
  // Backend should return: { success: true, data: [...], totalCount: 150, totalPages: 13 }
  const totalCount = (productsRes as any)?.totalCount || products.length;
  const totalPagesFromBackend = (productsRes as any)?.totalPages;

  console.log('📊 Backend Response Metadata:', {
    totalCount,
    totalPagesFromBackend,
    currentPageProducts: products.length
  });

  // Pagination metadata
  const metaData = {
    currentPage: page,
    totalPages: totalPagesFromBackend || (products.length < pageSize ? page : page + 1),
    totalCount: totalCount
  };

  // Şəkil URL düzəldən Helper

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
            
            {/* Toolbar (Search & Sort) - Show total filtered count, not just current page */}
            <ShopToolbar totalCount={metaData.totalCount} categories={categories} />

            {/* Məhsullar Grid-i - Backend handles all filtering */}
            {products.length > 0 ? (
              <>
                <ShopProductList
                  initialProducts={products}
                  serverSideFiltered={true} // Backend handles all filtering and pagination
                />

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