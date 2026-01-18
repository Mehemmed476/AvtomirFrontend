import { ApiResponse, Category, Product, ProductParams, PagedResult, ProductDetailDto, ProductListDto } from "@/types";
import Cookies from "js-cookie";

// Development-də Next.js proxy işlədir, production-da birbaşa backend-ə qoşulur
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? "/api"  // Local development - Next.js proxy istifadə edir
  : "http://45.67.203.108:8080/api";  // Production

const BASE_IMAGE_URL = "http://45.67.203.108:8080";

// Token-i cookie-dən oxu
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('token') || null;
}

// Helper funksiya: Şəkil URL-ini düzəlt
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return "";

  // Əgər artıq tam URL-dirsə, olduğu kimi qaytaraq
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Əgər / ilə başlayırsa, BASE_URL əlavə et
  if (path.startsWith("/")) {
    return `${BASE_IMAGE_URL}${path}`;
  }

  // Əks halda, /uploads/ prefix əlavə et (backend /uploads/products/ olaraq qayıdır)
  return `${BASE_IMAGE_URL}/uploads/${path}`;
}

// --- MÖVCUD FUNKSİYALAR (BUNLARA DƏYMƏDİK) ---

// Shop və Admin panel üçün məhsulların siyahısı (pagination və filterlər ilə)
export async function getProducts(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }
): Promise<ApiResponse<ProductListDto[]> | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    // Only add filter parameters if they have valid values (prevents 400 errors)
    if (filters) {
      if (filters.search && filters.search.trim() !== '') {
        params.append('search', filters.search.trim());
      }
      if (filters.categoryId && filters.categoryId > 0) {
        params.append('categoryId', filters.categoryId.toString());
      }
      if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice >= 0) {
        params.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice >= 0) {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.sort && filters.sort.trim() !== '') {
        params.append('sort', filters.sort.trim());
      }
    }

    const url = `${API_URL}/products?${params.toString()}`;
    console.log('📡 API Request URL:', url);
    console.log('📡 Filters:', filters);

    const res = await fetch(url, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('❌ API Error:', res.status, res.statusText);
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('✅ API Response:', data);
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

export async function getCategories(): Promise<ApiResponse<Category[]> | null> {
  try {
    const res = await fetch(`${API_URL}/categories/tree`, { next: { revalidate: 3600 } });
    
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


// Məhsulu ID ilə gətirmək (Edit üçün)
export async function getProductById(id: string | number): Promise<ApiResponse<ProductDetailDto> | null> {
  const token = getToken();

  try {
    console.log("🔍 Məhsul yüklənir, ID:", id);
    const url = `${API_URL}/products/${id}`;  // Backend: [HttpGet("{id:int}")]
    console.log("🔍 URL:", url);

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      cache: 'no-store',
      headers
    });

    console.log("🔍 Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔴 API Error:", res.status, errorText);
      return null;
    }

    const data = await res.json();
    console.log("✅ Məhsul datası:", data);
    return data;
  } catch (error) {
    console.error("Product Fetch Error:", error);
    return null;
  }
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

// Şəkil yükləmək (Token ilə)
export async function uploadImage(file: File): Promise<ApiResponse<string>> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: "",
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_URL}/images/upload`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Şəkil yüklənmədi: ${res.status} ${res.statusText}`,
        data: "",
        statusCode: res.status,
        errors: [errorText || "Upload failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Upload Error:", error);
    return {
      success: false,
      message: "Şəkil yükləmə xətası",
      data: "",
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Məhsul yaratmaq (JSON ilə)
export async function createProduct(data: {
  name: string;
  sku?: string;
  brandId?: number;
  price: number;
  oldPrice?: number;
  shortDescription: string;  // REQUIRED
  description?: string;
  mainImageUrl: string;
  galleryImageUrls: string[];  // REQUIRED (boş array olabilir)
  categoryIds: number[];  // REQUIRED (boş array olabilir)
  isNew: boolean;
  isInStock: boolean;
}): Promise<ApiResponse<number>> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: 0,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    console.log("🔵 Göndərilən məhsul datası:", JSON.stringify(data, null, 2));

    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔴 Backend xətası:", {
        status: res.status,
        statusText: res.statusText,
        response: errorText
      });
      return {
        success: false,
        message: `Məhsul yaradılmadı: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Create failed"]
      };
    }

    const result = await res.json();
    console.log("✅ Uğurlu cavab:", result);
    return result;
  } catch (error) {
    console.error("Create Product Error:", error);
    return {
      success: false,
      message: "Məhsul yaratma xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}



// Məhsulu Yeniləmək (Update)
export async function updateProduct(id: number, data: {
  id: number;  // Backend DTO'da Id field'i mütləqdir
  name: string;
  sku?: string;
  brandId?: number;
  price: number;
  oldPrice?: number;
  shortDescription: string;
  description?: string;
  mainImageUrl: string;
  galleryImageUrls: string[];
  categoryIds: number[];
  isNew: boolean;
  isInStock: boolean;
  isActive: boolean;
}): Promise<ApiResponse<boolean>> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: false,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    console.log("🔵 Yenilənən məhsul datası:", JSON.stringify(data, null, 2));

    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔴 Backend xətası:", {
        status: res.status,
        statusText: res.statusText,
        response: errorText
      });
      return {
        success: false,
        message: `Məhsul yenilənmədi: ${res.status} ${res.statusText}`,
        data: false,
        statusCode: res.status,
        errors: [errorText || "Update failed"]
      };
    }

    const result = await res.json();
    console.log("✅ Uğurlu cavab:", result);
    return result;
  } catch (error) {
    console.error("Update Product Error:", error);
    return {
      success: false,
      message: "Məhsul yeniləmə xətası",
      data: false,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Məhsulu Silmək
export async function deleteProduct(id: number): Promise<ApiResponse<null>> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: null,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Məhsul silinmədi: ${res.status} ${res.statusText}`,
        data: null,
        statusCode: res.status,
        errors: [errorText || "Delete failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Delete Product Error:", error);
    return {
      success: false,
      message: "Məhsul silmə xətası",
      data: null,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// ============================================
// CATEGORY CRUD OPERATIONS
// ============================================

// Kateqoriya yaratmaq
export async function createCategory(data: {
  name: string;
  description: string;
  parentId?: number | null;
  imageUrl?: string;
}): Promise<ApiResponse<number>> {  // DEĞİŞTİ: Category → number (backend ID qaytarır)
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: 0,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Kateqoriya yaradılmadı: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Create failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Create Category Error:", error);
    return {
      success: false,
      message: "Kateqoriya yaratma xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Kateqoriya yeniləmək
export async function updateCategory(id: number, data: {
  id: number;
  name: string;
  description: string;
  parentId?: number | null;
  imageUrl?: string;
}): Promise<ApiResponse<boolean>> {  // DEĞİŞTİ: Category → boolean
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: false,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Kateqoriya yenilənmədi: ${res.status} ${res.statusText}`,
        data: false,
        statusCode: res.status,
        errors: [errorText || "Update failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Update Category Error:", error);
    return {
      success: false,
      message: "Kateqoriya yeniləmə xətası",
      data: false,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Kateqoriya silmək
export async function deleteCategory(id: number): Promise<ApiResponse<null>> {
  const token = getToken();

  if (!token) {
    return {
      success: false,
      message: "Token tapılmadı. Zəhmət olmasa yenidən login olun.",
      data: null,
      statusCode: 401,
      errors: ["Unauthorized"]
    };
  }

  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Kateqoriya silinmədi: ${res.status} ${res.statusText}`,
        data: null,
        statusCode: res.status,
        errors: [errorText || "Delete failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Delete Category Error:", error);
    return {
      success: false,
      message: "Kateqoriya silmə xətası",
      data: null,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Kateqoriya ID ilə gətirmək (Edit üçün)
export async function getCategoryById(id: number): Promise<ApiResponse<Category> | null> {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Category Fetch Error:", error);
    return null;
  }
}