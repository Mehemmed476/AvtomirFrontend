"use client";

import { ProductListDto } from "@/types";
import { deleteProduct, getImageUrl } from "@/lib/api";
import { Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useConfirm } from "@/components/admin/ConfirmModal";

interface Props {
  products: ProductListDto[];
}

export default function ProductsTable({ products }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const handleDelete = async (id: number, name: string) => {
    const confirmed = await confirm({
      title: "Məhsulu sil",
      message: `"${name}" məhsulunu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: "Sil",
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const res = await deleteProduct(id);

      if (res?.success) {
        toast.success("Məhsul uğurla silindi");
        router.refresh();
      } else {
        toast.error(res?.message || "Xəta baş verdi");
      }
    } catch (error) {
      toast.error("Sistem xətası");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Məhsul tapılmadı 😕
                </td>
              </tr>
            ) : (
              products.map((product) => (
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
                        ) : (
                          <ImageIcon className="m-auto text-slate-300 mt-3" size={20} />
                        )}
                      </div>
                      <span className="font-semibold text-slate-700 line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {product.brandName || '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {product.price} ₼
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${(product.stockQuantity || 0) > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {product.stockQuantity || 0} ədəd
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Düzəliş et"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleteLoading === product.id}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Sil"
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
    </div>
  );
}