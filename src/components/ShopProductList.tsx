"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductListDto } from "@/types";
import { ShoppingCart, Search } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getImageUrl } from "@/lib/api";

interface Props {
  initialProducts: ProductListDto[];
  serverSideFiltered?: boolean; // If true, products are already filtered by server
}

/**
 * Client-Side Product List with Filtering
 *
 * This component provides client-side filtering as a fallback if the backend
 * doesn't support server-side filtering. It reads filter parameters from URL
 * and applies them to the product list.
 *
 * Features:
 * - Search by name (case-insensitive)
 * - Filter by category
 * - Filter by price range
 * - Sort products
 */
export default function ShopProductList({ initialProducts, serverSideFiltered = false }: Props) {
  const searchParams = useSearchParams();

  // Extract filter parameters from URL
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const sort = searchParams.get('sort') || '';

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    // If backend already filtered, return as-is
    if (serverSideFiltered) {
      console.log('✅ Using server-side filtered products');
      return initialProducts;
    }

    console.log('🔄 Applying client-side filters:', {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sort,
      totalProducts: initialProducts.length
    });

    let filtered = [...initialProducts];

    // 1. Search filter (by name or description)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (categoryId) {
      filtered = filtered.filter(p => {
        // Check if product has categories array with matching ID
        if (Array.isArray((p as any).categories)) {
          return (p as any).categories.some((cat: any) => cat.id === categoryId);
        }
        // Check if product has categoryId field
        if ((p as any).categoryId) {
          return (p as any).categoryId === categoryId;
        }
        return false;
      });
    }

    // 3. Price range filter
    if (minPrice !== null) {
      filtered = filtered.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    // 4. Sort products
    if (sort) {
      switch (sort) {
        case 'priceAsc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'priceDesc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          // Assuming newer products have higher IDs
          filtered.sort((a, b) => b.id - a.id);
          break;
        default:
          // Default sort (as received from backend)
          break;
      }
    }

    console.log(`✅ Client-side filtering complete: ${filtered.length} products`);
    return filtered;
  }, [initialProducts, search, categoryId, minPrice, maxPrice, sort, serverSideFiltered]);

  if (filteredProducts.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((item) => (
        <div key={item.id} className="group bg-dark-800 rounded-2xl p-4 border border-dark-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 relative flex flex-col">

          {/* ETIKETLƏR */}
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

          {/* ŞƏKİL */}
          <div className="aspect-[4/3] bg-white rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
            <img
              src={getImageUrl(item.mainImageUrl)}
              alt={item.name}
              className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* MƏLUMATLAR */}
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1"></p>
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
  );
}
