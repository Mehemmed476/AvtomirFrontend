"use client";

import { useRouter } from "@/i18n/routing"; 
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, Filter, Check } from "lucide-react";
import { Category } from "@/types";
import { useDebouncedCallback } from "use-debounce";
import { useTranslations } from "next-intl";

interface Props {
  categories: Category[];
  onClose?: () => void;
}

export default function ShopSidebar({ categories, onClose }: Props) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const selectedCatId = searchParams.get("categoryId");

  const updateUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("pageNumber", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = useDebouncedCallback((min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min); else params.delete("minPrice");
    if (max) params.set("maxPrice", max); else params.delete("maxPrice");
    params.set("pageNumber", "1");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }, 500);

  const onMinChange = (val: string) => { setMinPrice(val); handlePriceChange(val, maxPrice); };
  const onMaxChange = (val: string) => { setMaxPrice(val); handlePriceChange(minPrice, val); };

  const toggleCategory = (id: number) => {
    if (selectedCatId === id.toString()) {
      updateUrl("categoryId", null);
    } else {
      updateUrl("categoryId", id.toString());
    }
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push("/shop");
    if (onClose) onClose();
  };

  return (
    <div 
      className={`
        bg-dark-800 rounded-2xl border border-dark-700 shadow-xl shadow-black/20 flex flex-col
        ${onClose ? 'h-full border-none rounded-none' : 'sticky top-24 h-[85vh]'} 
      `}
    >
      
      {/* 1. HEADER (SABİT) - Scroll olunmur */}
      <div className="flex-none p-6 border-b border-dark-700 flex items-center justify-between bg-dark-800 rounded-t-2xl z-20">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Filter size={18} className="text-primary" /> {t('filters')}
        </h3>
        
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        )}

        {!onClose && (minPrice || maxPrice || selectedCatId) && (
          <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <X size={14} /> {t('clear')}
          </button>
        )}
      </div>

      {/* 2. BODY (SCROLL) - Yalnız bura scroll olur */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        
        {/* Qiymət */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-300 mb-3 text-sm uppercase tracking-wide flex justify-between">
            {t('price')} (AZN)
          </h4>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => onMinChange(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-3 pr-2 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
              />
            </div>
            <span className="text-gray-500 font-bold">-</span>
            <div className="relative w-full">
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => onMaxChange(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-3 pr-2 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Kateqoriyalar */}
        <div>
          <h4 className="font-medium text-gray-300 mb-3 text-sm uppercase tracking-wide">
              {t('categories')}
          </h4>
          <div className="space-y-1 pb-4">
            {categories.length > 0 ? categories.map((cat) => {
              const isActive = selectedCatId === cat.id.toString();
              return (
                <button 
                  key={cat.id} 
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
                    ${isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-gray-400 hover:bg-dark-700 hover:text-white border border-transparent"}
                  `}
                >
                  <span className="text-left">{cat.name}</span>
                  {isActive && <Check size={14} className="shrink-0" />}
                </button>
              );
            }) : (
              <p className="text-gray-600 text-xs italic">Kateqoriya tapılmadı</p>
            )}
          </div>
        </div>
      </div>
      
      {/* 3. FOOTER (MOBILE ÜÇÜN DÜYMƏ) - Sabit */}
      {onClose && (
        <div className="flex-none p-4 border-t border-dark-700 bg-dark-800">
            <button 
            onClick={onClose}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl lg:hidden"
            >
            Nəticələri Göstər
            </button>
        </div>
      )}

    </div>
  );
}