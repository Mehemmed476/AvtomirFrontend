"use client";

import { Product } from "@/types";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { getImageUrl } from "@/lib/api"; // Şəkil helperini import et

interface Props {
  initialProducts: Product[];
  serverSideFiltered?: boolean;
  viewMode?: 'grid' | 'list'; // Yeni prop
}

export default function ShopProductList({ initialProducts, viewMode = 'grid' }: Props) {
  
  return (
    <div className={`
      ${viewMode === 'grid' 
        ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'flex flex-col gap-6'} // List mode: Flex column
    `}>
      {initialProducts.map((product) => (
        <div 
          key={product.id} 
          className={`
            group bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative
            ${viewMode === 'list' ? 'flex flex-row items-center h-48' : 'flex flex-col'}
          `}
        >
          
          {/* Məhsul Şəkli */}
          <div className={`
            relative overflow-hidden bg-dark-900
            ${viewMode === 'list' ? 'w-48 h-full shrink-0' : 'w-full aspect-[4/3]'}
          `}>
             {/* Yeni Etiketi */}
             {product.isNew && (
                <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase tracking-wider">
                  Yeni
                </span>
             )}
             
             {/* İndirim Etiketi */}
             {product.oldPrice && product.oldPrice > product.price && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
             )}

             <Image
              src={getImageUrl(product.mainImageUrl)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Məlumatlar */}
          <div className="p-4 flex-1 flex flex-col justify-between h-full">
            <div>
              <Link href={`/product/${product.slug}`} className="block">
                <h3 className="font-bold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors text-lg">
                  {product.name}
                </h3>
              </Link>
              <div className="text-xs text-gray-500 mb-3">{product.brandName || "Avtomir"}</div>
              
              {/* List görünümü için kısa açıklama eklenebilir */}
              {viewMode === 'list' && (
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 hidden sm:block">
                  {product.shortDescription || "Məhsul haqqında ətraflı məlumat üçün daxil olun."}
                </p>
              )}
            </div>

            <div className={`flex items-end justify-between ${viewMode === 'list' ? 'gap-6' : ''}`}>
              <div>
                {product.oldPrice && (
                  <div className="text-gray-500 text-sm line-through decoration-red-500/50">
                    {product.oldPrice} ₼
                  </div>
                )}
                <div className="text-primary font-bold text-xl">
                  {product.price} ₼
                </div>
              </div>

              {/* Düymələr (List modunda sağa yaslanır) */}
              <div className="flex gap-2">
                 <Link 
                   href={`/product/${product.slug}`}
                   className="p-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors"
                   title="Ətraflı"
                 >
                   <Eye size={18} />
                 </Link>
                 <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
                   <ShoppingCart size={18} />
                 </button>
              </div>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}