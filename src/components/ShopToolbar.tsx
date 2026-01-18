"use client";

import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, Check, Filter } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Category } from "@/types";
import ShopSidebar from "./ShopSidebar"; // Sidebar-ı bura çağırırıq

interface Props {
  totalCount: number;
  categories: Category[]; // DÜZƏLİŞ: Kateqoriyalar bura gəlməlidir
}

export default function ShopToolbar({ totalCount, categories }: Props) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Mobile Filter State
  const sortRef = useRef<HTMLDivElement>(null);

  // Kənara basanda Sort bağlansın
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Logic
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set("search", term);
    else params.delete("search");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, 500);

  // Sort Logic
  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    router.push(`?${params.toString()}`, { scroll: false });
    setIsSortOpen(false);
  };

  const sortOptions = [
    { label: t('Sort.default'), value: "" },
    { label: t('Sort.priceAsc'), value: "priceAsc" },
    { label: t('Sort.priceDesc'), value: "priceDesc" },
    { label: t('Sort.newest'), value: "newest" },
  ];

  const currentSortValue = searchParams.get("sort") || "";
  const currentSortLabel = sortOptions.find(o => o.value === currentSortValue)?.label || t('Sort.label');

  return (
    <>
      <div className="bg-dark-800 p-4 rounded-2xl border border-dark-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-lg shadow-black/10">
        
        {/* Sol: Axtarış */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            defaultValue={searchParams.get("search")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Sağ Tərəf: Filter (Mobil) + Sort + Count */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* MOBILE FILTER BUTTON (Yalnız Mobildə görünür) */}
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-white hover:border-primary transition-colors flex-1 md:flex-none"
          >
            <Filter size={18} />
            <span className="text-sm font-medium">{t('filters')}</span>
          </button>

          {/* Desktop Count */}
          <div className="hidden lg:block text-xs text-gray-500 font-medium bg-dark-900 px-3 py-2 rounded-lg border border-dark-700">
            {totalCount} {t('results')}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full md:w-48 flex-1 md:flex-none" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`
                w-full flex items-center justify-between bg-dark-900 border border-dark-600 
                rounded-xl px-4 py-3 text-sm text-white transition-all duration-200
                hover:border-primary/50 focus:border-primary
                ${isSortOpen ? "border-primary ring-1 ring-primary" : ""}
              `}
            >
              <span className="truncate">{currentSortLabel}</span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 w-full bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  {sortOptions.map((option) => {
                    const isSelected = option.value === currentSortValue;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSort(option.value)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                          ${isSelected 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-gray-300 hover:bg-dark-700 hover:text-white"}
                        `}
                      >
                        {option.label}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER (MODAL) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Arxa fon qaranlığı */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          
          {/* Sürüşən Panel */}
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-dark-900 shadow-2xl border-l border-dark-700 animate-in slide-in-from-right duration-300">
             <div className="h-full p-4">
                {/* Eyni ShopSidebar-ı burada istifadə edirik */}
                <ShopSidebar categories={categories} onClose={() => setIsMobileFilterOpen(false)} />
             </div>
          </div>
        </div>
      )}
    </>
  );
}