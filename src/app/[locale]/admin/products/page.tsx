"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getProducts, deleteProduct, bulkDeleteProducts, getImageUrl, getCategories, getCategoryProductCounts } from "@/lib/api";
import { ProductListDto, Category } from "@/types";
import { Edit, Trash2, Plus, Image as ImageIcon, Search, X, ChevronDown, ChevronRight, Filter, Folder, CheckSquare, Square } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useDebouncedCallback } from "use-debounce";
import { useConfirm } from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const confirm = useConfirm();

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<number, number>>({});
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const pageSize = 12;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : null;

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "search" || key === "categoryId") {
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

  const handleCategoryChange = (id: number | null) => {
    updateParams("categoryId", id ? id.toString() : null);
    setCategoryModalOpen(false);
    setCategorySearch("");
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setSelectedProducts(new Set()); // Sayfa dəyişəndə seçimləri sıfırla
    const res = await getProducts(page, pageSize, {
      search: search || undefined,
      categoryIds: categoryId ? [categoryId] : undefined
    });
    if (res?.success && res.data) {
      setProducts(res.data.items);
    }
    setLoading(false);
  }, [page, search, categoryId]);

  // Kategorileri ve product saylarını çek
  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      const [catRes, countsRes] = await Promise.all([
        getCategories(),
        getCategoryProductCounts()
      ]);
      if (catRes?.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (countsRes) {
        setCategoryProductCounts(countsRes);
      }
    };
    fetchCategoriesAndCounts();
  }, []);

  // Kategori adını bul (recursive)
  const findCategoryName = useCallback((cats: Category[], id: number): string | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat.name;
      if (cat.children) {
        const found = findCategoryName(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Kategori axtarışı üçün recursive filter
  const filterCategories = useCallback((cats: Category[], term: string): Category[] => {
    if (!term) return cats;
    return cats.map(cat => {
      const filteredChildren = cat.children ? filterCategories(cat.children, term) : [];
      const matches = cat.name.toLowerCase().includes(term.toLowerCase());
      if (matches || filteredChildren.length > 0) {
        return { ...cat, children: filteredChildren };
      }
      return null;
    }).filter(Boolean) as Category[];
  }, []);

  // Bütün kategori ID-lərini al (expand üçün)
  const getAllCategoryIds = useCallback((cats: Category[]): number[] => {
    let ids: number[] = [];
    for (const cat of cats) {
      ids.push(cat.id);
      if (cat.children) {
        ids = ids.concat(getAllCategoryIds(cat.children));
      }
    }
    return ids;
  }, []);

  // Axtarış zamanı bütün kateqoriyaları aç
  useEffect(() => {
    if (categorySearch) {
      const filtered = filterCategories(categories, categorySearch);
      setExpandedCategories(new Set(getAllCategoryIds(filtered)));
    }
  }, [categorySearch, categories, filterCategories, getAllCategoryIds]);

  const toggleExpand = (id: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(getAllCategoryIds(categories)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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
    const res = await deleteProduct(id);
    setDeleteLoading(null);

    if (res?.success) {
      toast.success("Məhsul uğurla silindi");
      await fetchProducts();
    } else {
      toast.error("Xəta baş verdi: " + (res?.message || "Məhsul silinmədi"));
    }
  };

  // Bulk delete handlers
  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    const confirmed = await confirm({
      title: "Çoxlu silmə",
      message: `${selectedProducts.size} məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!`,
      confirmText: `${selectedProducts.size} məhsulu sil`,
      cancelText: "Ləğv et",
      type: "danger"
    });

    if (!confirmed) return;

    setBulkDeleteLoading(true);
    const res = await bulkDeleteProducts(Array.from(selectedProducts));
    setBulkDeleteLoading(false);

    if (res?.success) {
      toast.success(`${res.data} məhsul uğurla silindi`);
      setSelectedProducts(new Set());
      await fetchProducts();
    } else {
      toast.error("Xəta baş verdi: " + (res?.message || "Məhsullar silinmədi"));
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
            {categoryId && <span className="ml-1 text-cyan-400">· {findCategoryName(categories, categoryId) || "Kateqoriya"}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProducts.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/25 font-medium disabled:opacity-50"
            >
              {bulkDeleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Silinir...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  {selectedProducts.size} məhsulu sil
                </>
              )}
            </button>
          )}
          <Link
            href="/admin/products/create"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 font-medium"
          >
            <Plus size={20} /> Yeni Məhsul
          </Link>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
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

        {/* Category Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm transition-all ${
              categoryId
                ? "bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30"
                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white"
            }`}
          >
            <Filter size={16} />
            <span>{categoryId ? findCategoryName(categories, categoryId) : "Kateqoriya seç"}</span>
            {categoryId && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
            )}
          </button>
          {categoryId && (
            <button
              onClick={() => handleCategoryChange(null)}
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Filtri təmizlə"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setCategoryModalOpen(false);
              setCategorySearch("");
            }}
          />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Folder size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Kateqoriya seçin</h3>
                  <p className="text-xs text-slate-500">{categories.length > 0 ? `${getAllCategoryIds(categories).length} kateqoriya mövcuddur` : "Yüklənir..."}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCategoryModalOpen(false);
                  setCategorySearch("");
                }}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Kateqoriya axtar..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                  autoFocus
                />
                {categorySearch && (
                  <button
                    onClick={() => setCategorySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Expand/Collapse buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={expandAll}
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Hamısını aç
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Hamısını bağla
                </button>
              </div>
            </div>

            {/* Category Tree */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Clear filter option */}
              <button
                onClick={() => handleCategoryChange(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2 ${
                  !categoryId
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center">
                  <X size={14} />
                </div>
                <span>Hamısı (filtr yoxdur)</span>
              </button>

              {/* Tree */}
              {(() => {
                const filteredCats = filterCategories(categories, categorySearch);

                const renderTree = (cats: Category[], level = 0): React.ReactNode => {
                  return cats.map(cat => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    const isExpanded = expandedCategories.has(cat.id);
                    const isSelected = categoryId === cat.id;

                    return (
                      <div key={cat.id}>
                        <div
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                          style={{ marginLeft: `${level * 16}px` }}
                        >
                          {/* Expand/Collapse */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(cat.id);
                            }}
                            className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${
                              hasChildren
                                ? "hover:bg-slate-700 text-slate-500"
                                : "opacity-0 cursor-default"
                            }`}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          {/* Select */}
                          <button
                            onClick={() => handleCategoryChange(cat.id)}
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-blue-500" : "bg-slate-700"
                            }`}>
                              <Folder size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                            </div>
                            <span className="text-sm font-medium truncate">
                              {categorySearch ? (
                                <span dangerouslySetInnerHTML={{
                                  __html: cat.name.replace(
                                    new RegExp(`(${categorySearch})`, 'gi'),
                                    '<span class="bg-yellow-500/30 text-yellow-200">$1</span>'
                                  )
                                }} />
                              ) : cat.name}
                            </span>
                            <span className="flex items-center gap-2 ml-auto">
                              {categoryProductCounts[cat.id] !== undefined && categoryProductCounts[cat.id] > 0 && (
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md">
                                  {categoryProductCounts[cat.id]} məhsul
                                </span>
                              )}
                              {hasChildren && (
                                <span className="text-xs text-slate-600">
                                  {cat.children!.length} alt
                                </span>
                              )}
                            </span>
                          </button>
                        </div>

                        {/* Children */}
                        {hasChildren && isExpanded && (
                          <div className="border-l-2 border-slate-800 ml-6">
                            {renderTree(cat.children!, level + 1)}
                          </div>
                        )}
                      </div>
                    );
                  });
                };

                if (filteredCats.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search size={24} className="text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">
                        &quot;{categorySearch}&quot; üçün nəticə tapılmadı
                      </p>
                    </div>
                  );
                }

                return renderTree(filteredCats);
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title={selectedProducts.size === products.length ? "Hamısını seçmə" : "Hamısını seç"}
                  >
                    {products.length > 0 && selectedProducts.size === products.length ? (
                      <CheckSquare size={20} className="text-blue-400" />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Məhsul</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Brend</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Qiymət</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Yüklənir...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
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
                  <tr key={product.id} className={`hover:bg-slate-800/30 transition-colors group ${selectedProducts.has(product.id) ? 'bg-blue-500/10' : ''}`}>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelectProduct(product.id)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {selectedProducts.has(product.id) ? (
                          <CheckSquare size={20} className="text-blue-400" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
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
