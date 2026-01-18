"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getProducts, deleteProduct, getImageUrl } from "@/lib/api";
import { ProductListDto } from "@/types";
import { Edit, Trash2, Plus, Image as ImageIcon, Search, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const pageSize = 12;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "search") {
      params.set("page", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    updateParams("search", term || null);
  }, 400);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    handleSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput("");
    updateParams("search", null);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await getProducts(page, pageSize, { search: search || undefined });
    if (res?.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" məhsulunu silmək istədiyinizə əminsiniz?`)) return;

    setDeleteLoading(id);
    const res = await deleteProduct(id);
    setDeleteLoading(null);

    if (res?.success) {
      await fetchProducts();
    } else {
      alert("Xəta baş verdi: " + (res?.message || "Məhsul silinmədi"));
    }
  };

  const setPage = (newPage: number) => {
    updateParams("page", newPage.toString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Məhsullar</h1>
          <p className="text-slate-400 text-sm mt-1">
            {products.length} məhsul göstərilir (Səhifə {page})
            {search && <span className="ml-1 text-blue-400">· &quot;{search}&quot; üçün nəticələr</span>}
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 font-medium"
        >
          <Plus size={20} /> Yeni Məhsul
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Məhsul axtar..."
          value={searchInput}
          onChange={onSearchChange}
          className="w-full pl-11 pr-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
        />
        {searchInput && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Məhsul</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Brend</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Qiymət</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Yüklənir...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <ImageIcon size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-400">
                        {search ? `"${search}" üçün məhsul tapılmadı` : "Məhsul tapılmadı"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex-shrink-0 relative overflow-hidden border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                          {product.mainImageUrl ? (
                            <Image
                              src={getImageUrl(product.mainImageUrl)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <ImageIcon className="m-auto text-slate-600 mt-4" size={22} />
                          )}
                        </div>
                        <span className="font-semibold text-white line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{product.brandName || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        {product.price} ₼
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="p-2.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteLoading === product.id}
                          className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(page > 1 || products.length === pageSize) && (
          <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between">
            <p className="text-sm text-slate-500">Səhifə {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 border border-slate-700/50 transition-all"
              >
                Əvvəlki
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={products.length < pageSize}
                className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700/50 border border-slate-700/50 transition-all"
              >
                Növbəti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
