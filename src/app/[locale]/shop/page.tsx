import { getTranslations } from 'next-intl/server';
import { getProducts, getCategories } from '@/lib/api';
import Pagination from '@/components/Pagination';
import ShopSidebar from '@/components/ShopSidebar';
import ShopToolbar from '@/components/ShopToolbar';
import ShopProductList from '@/components/ShopProductList';
import { Search } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Avtomobil Ehtiyat Hissələri Kataloqu | Orijinal və Dublikat Zapçastlar",
  description: "Mühərrik, asqı sistemi, təkərlər, yağlar və filtrlər. Hyundai, BMW, Toyota və 50+ marka üçün ehtiyat hissələri. Bakıda ən geniş zapçast seçimi və münasib qiymətlər.",
};

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: Props) {
  const t = await getTranslations('Shop'); // Tərcümələri yükləyirik

  // 1. URL-dən bütün parametrləri oxuyuruq
  const resolvedParams = await searchParams;

  const page = Number(resolvedParams.page) || 1;
  const pageSize = 12;
  const viewMode = (resolvedParams.view as 'grid' | 'list') || 'grid';

  const search = resolvedParams.search?.toString();
  const categoryId = resolvedParams.categoryId ? Number(resolvedParams.categoryId) : undefined;
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort?.toString();

  // Debug
  console.log('🔍 Shop Filters:', { page, search, categoryId, sort });

  // 2. Fetching
  const productsData = getProducts(page, pageSize, {
    search,
    categoryId,
    minPrice,
    maxPrice,
    sort,
  });
  const categoriesData = getCategories();

  const [productsRes, categoriesRes] = await Promise.all([productsData, categoriesData]);

  const pagedResult = productsRes?.data;
  const products = pagedResult?.items || [];
  const categories = categoriesRes?.data || [];

  const metaData = {
    currentPage: pagedResult?.pageNumber || page,
    totalPages: pagedResult?.totalPages || 1,
    totalCount: pagedResult?.totalCount || 0
  };

  return (
    <main className="min-h-screen bg-dark-900 text-white pt-8 pb-20 px-4">
      <div className="container mx-auto">

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* SIDEBAR */}
          <aside className="w-full lg:w-1/4 hidden lg:block h-fit sticky top-24">
            <ShopSidebar categories={categories} />
          </aside>

          {/* MƏZMUN */}
          <section className="w-full lg:w-3/4">

            {/* Toolbar */}
            <ShopToolbar categories={categories} />

            {/* Məhsullar Grid-i */}
            {products.length > 0 ? (
              <>
                <ShopProductList
                  initialProducts={products}
                  serverSideFiltered={true}
                  viewMode={viewMode}
                />

                {/* Pagination */}
                {(metaData.totalPages > 1) && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={metaData.currentPage}
                      totalPages={metaData.totalPages}
                    />
                  </div>
                )}
              </>
            ) : (
              // --- MƏHSUL TAPILMADIQDA (Düzəliş edilən hissə) ---
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-dark-800 rounded-3xl border border-dark-700 border-dashed text-center">
                <div className="bg-dark-700 p-6 rounded-full mb-6">
                  <Search size={40} className="text-gray-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  {t('noResultsTitle') || "Təəssüf, heç nə tapılmadı 😕"}
                </h2>

                <p className="text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                  {t('noResultsDesc') || "Axtarış sözünü dəyişdirin və ya filtrləri təmizləyib yenidən yoxlayın."}
                </p>

                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-medium shadow-lg shadow-primary/25"
                >
                  {t('clearFilters') || "Filtrləri Təmizlə"}
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}