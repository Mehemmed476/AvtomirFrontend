"use client";

import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "@/lib/api";
import { Product, PagedResult } from "@/types";
import { Edit, Trash2, Plus, Search, Image as ImageIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function AdminProductsPage() {
  const [data, setData] = useState<PagedResult<Product> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getProducts({ pageNumber: page, pageSize: 10, search });
    if (res?.success) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Məhsullar</h1>
          <p className="text-slate-500 text-sm">Ümumi {data?.totalCount || 0} məhsul tapıldı.</p>
        </div>
        <Link href="/admin/products/create" className="bg-blue-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg">
          <Plus size={20} /> Yeni Məhsul
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
            ) : data?.items.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 relative overflow-hidden border border-slate-200">
                      {product.mainImageUrl ? ( // DÜZƏLİŞ: mainImageUrl
                        <Image src={product.mainImageUrl} alt={product.name} fill className="object-cover" />
                      ) : <ImageIcon className="m-auto text-slate-300 mt-3" size={20} />}
                    </div>
                    <span className="font-semibold text-slate-700 line-clamp-1">{product.name}</span> // DÜZƏLİŞ: name
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">{product.brandName}</td> // DÜZƏLİŞ: brandName
                <td className="px-6 py-4 font-bold text-blue-600">{product.price} ₼</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${product.stockQuantity > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {product.stockQuantity} ədəd // DÜZƏLİŞ: stockQuantity
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-slate-400 hover:text-blue-600">
                      <Edit size={18} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}