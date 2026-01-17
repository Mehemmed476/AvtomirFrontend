import { ApiResponse, Category, Product, ProductParams, PagedResult, SiteSettings } from "@/types";

const API_URL = "http://45.67.203.108:8080/api";

export async function getProducts(params: ProductParams): Promise<ApiResponse<PagedResult<Product>> | null> {
  try {
    // 1. Parametrləri URL üçün hazırlayırıq
    const query = new URLSearchParams();

    if (params.pageNumber) query.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);
    if (params.categoryId) query.append("categoryId", params.categoryId.toString());
    if (params.minPrice) query.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) query.append("maxPrice", params.maxPrice.toString());

    // 2. Sorğunu göndəririk (Məs: api/products?pageNumber=2&search=bmw)
    const res = await fetch(`${API_URL}/products?${query.toString()}`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error("API Xətası");
    
    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

export async function getCategories(): Promise<ApiResponse<Category[]> | null> {
  try {
    // DÜZƏLİŞ: "/categories" yox, "/categories/flat" olmalıdır!
    const res = await fetch(`${API_URL}/categories/flat`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Category Fetch Error:", error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product> | null> {
  try {
    // DÜZƏLİŞ: slug-ı encode edirik ki, xüsusi simvollar (%c9%99 və s.) düzgün getsin
    const encodedSlug = encodeURIComponent(slug); 
    
    // Yoxlamaq üçün konsola yazırıq (Bunu server terminalında görəcəksən)
    console.log("Orijinal Slug:", slug);
    console.log("Encoded Slug:", encodedSlug);

    const res = await fetch(`${API_URL}/products/${encodedSlug}`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
        console.error(`API Error: ${res.status} - ${res.statusText}`);
        return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("Product Detail Error:", error);
    return null;
  }
}

export async function getSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 0 } }); // Həmişə təzə data
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Settings Error:", error);
    return null;
  }
}

export async function updateSettings(data: SiteSettings): Promise<any> {
  const res = await fetch(`${API_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}