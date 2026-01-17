"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-i dəyişən funksiya (Səhifə yenilənmir, sadəcə URL dəyişir)
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageNumber", page.toString());
    
    // URL-i yeniləyirik (Next.js server komponenti bunu tutacaq)
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null; // 1 səhifə varsa gizlət

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {/* Geri Düyməsi */}
      <button 
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 bg-dark-800 rounded-lg hover:bg-primary disabled:opacity-50 disabled:hover:bg-dark-800 transition-colors text-white"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Səhifə Nömrəsi */}
      <span className="px-4 py-2 bg-dark-800 rounded-lg text-white font-mono border border-dark-700">
        {currentPage} / {totalPages}
      </span>

      {/* İrəli Düyməsi */}
      <button 
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 bg-dark-800 rounded-lg hover:bg-primary disabled:opacity-50 disabled:hover:bg-dark-800 transition-colors text-white"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}