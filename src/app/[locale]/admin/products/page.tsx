"use client";

import { useEffect, useState, useCallback } from "react";
import { getProducts, deleteProduct, getImageUrl } from "@/lib/api";
import { ProductListDto } from "@/types";
import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const pageSize = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await getProducts(page, pageSize);
    if (res?.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Məhsullar</h1>
          <p className="text-slate-500 text-sm">{products.length} məhsul göstərilir (Səhifə {page})</p>
        </div>
        <Link href="/admin/products/create" className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg">
          <Plus size={20} /> Yeni Məhsul
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Məhsul</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Brend</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Qiymət</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stok</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Yüklənir...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Məhsul tapılmadı</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 relative overflow-hidden border border-slate-200">
                        {product.mainImageUrl ? (
                          <Image
                            src={getImageUrl(product.mainImageUrl)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : <ImageIcon className="m-auto text-slate-300 mt-3" size={20} />}
                      </div>
                      <span className="font-semibold text-slate-700 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{product.brandName || '-'}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{product.price} ₼</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${(product.stockQuantity || 0) > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {product.stockQuantity || 0} ədəd
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleteLoading === product.id}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(page > 1 || products.length === pageSize) && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Səhifə {page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
              >
                Əvvəlki
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={products.length < pageSize}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
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