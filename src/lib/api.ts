import { ApiResponse, Category, Product, ProductParams, PagedResult, SiteSettings } from "@/types";

// Əgər lokalda işləyirsənsə bunu "https://localhost:7152/api" (və ya öz portunla) dəyişə bilərsən.
// Hazırda faylında olan IP-ni saxladım:
const API_URL = "http://45.67.203.108:8080/api";

// --- MÖVCUD FUNKSİYALAR (BUNLARA DƏYMƏDİK) ---

export async function getProducts(params: ProductParams): Promise<ApiResponse<PagedResult<Product>> | null> {
  try {
    const query = new URLSearchParams();

    if (params.pageNumber) query.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);
    if (params.categoryId) query.append("categoryId", params.categoryId.toString());
    if (params.minPrice) query.append("minPrice", params.minPrice.toString());
    if (params.maxPrice) query.append("maxPrice", params.maxPrice.toString());

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
    const encodedSlug = encodeURIComponent(slug); 
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
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 0 } });
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

// --- YENİ ƏLAVƏ EDİLƏN HİSSƏ (LOGIN) ---

// Login üçün lazım olan tiplər
export interface LoginRequest {
  Email: string;
  Password: string; // Backend-də parol sahəsi necə adlanırsa elə yaz (məs: password və ya pass)
}

export interface LoginResponse {
  token: string;
  expireDate?: string;
  // Backend-dən qayıdan digər sahələr varsa bura əlavə et
}

// Login Funksiyası
export async function loginAdmin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    // "/auth/login" hissəsi sənin backend-dəki endpoint-in olmalıdır
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    return json;
    
  } catch (error) {
    console.error("Login Error:", error);
    // Xəta halında standart cavab qaytarırıq ki, kod partlamasın
    return { 
      success: false, 
      message: "Serverlə əlaqə yaradıla bilmədi", 
      data: { token: "" }, 
      errors: ["Network Error"],
      statusCode: 500
    };
  }
}

export async function createProduct(formData: FormData): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    body: formData, // Şəkillər olduğu üçün JSON yox, FormData göndəririk
  });
  return await res.json();
}

// Məhsulu Yeniləmək
export async function updateProduct(id: string | number, formData: FormData): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    body: formData,
  });
  return await res.json();
}

// Məhsulu Silmək
export async function deleteProduct(id: number): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });
  return await res.json();
}