import { ApiResponse, Category, Product, ProductParams, PagedResult, ProductDetailDto, ProductListDto } from "@/types";
import Cookies from "js-cookie";

// DƏYİŞİKLİK: Production-da artıq birbaşa domenə (Nginx-ə) müraciət edəcək
export const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? "/api"  // Local development - Next.js proxy istifadə edir
  : "https://avtomir.az/api";  // Production

// DƏYİŞİKLİK: Şəkillər üçün əsas URL domen olacaq
export const BASE_IMAGE_URL = "https://avtomir.az";

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

// --- MÖVCUD FUNKSİYALAR ---

// Shop və Admin panel üçün məhsulların siyahısı (pagination və filterlər ilə)
export async function getProducts(
  page: number = 1,
  pageSize: number = 12,
  filters?: {
    search?: string;
    categoryIds?: number[]; // Single ID yenine ID array'i
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }
): Promise<ApiResponse<PagedResult<ProductListDto>> | null> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    // Only add filter parameters if they have valid values
    if (filters) {
      if (filters.search && filters.search.trim() !== '') {
        params.append('search', filters.search.trim());
      }

      // Handle multiple category IDs
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        filters.categoryIds.forEach(id => {
          if (id > 0) params.append('categoryIds', id.toString());
        });
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

// Kateqoriyaların məhsul sayını əldə et
export async function getCategoryProductCounts(): Promise<Record<number, number>> {
  try {
    const res = await fetch(`${API_URL}/categories/product-counts`, { cache: 'no-store' });

    if (!res.ok) {
      console.warn("Category product counts endpoint not available");
      return {};
    }

    const data = await res.json();

    // Backend { categoryId: count } formatında qaytarır
    if (data && typeof data === 'object') {
      // Əgər ApiResponse formatındadırsa
      if (data.success !== undefined && data.data) {
        return data.data;
      }
      // Əgər direct object-dirsə
      return data;
    }

    return {};
  } catch (error) {
    console.error("Category Product Counts Error:", error);
    return {};
  }
}

export async function getProductBySlug(slug: string): Promise<ApiResponse<Product> | null> {
  try {
    const encodedSlug = encodeURIComponent(slug);
    const res = await fetch(`${API_URL}/products/${encodedSlug}`, { cache: 'no-store' });

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
    const url = `${API_URL}/products/${id}`;
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

// --- LOGIN HİSSƏSİ ---

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  expireDate?: string;
}

// Login Funksiyası
export async function loginAdmin(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    return json;

  } catch (error) {
    console.error("Login Error:", error);
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

  console.log("📤 Image upload başladı:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    hasToken: !!token
  });

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
    const uploadUrl = `${API_URL}/images/upload`;
    console.log("📤 Upload URL:", uploadUrl);

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    console.log("📤 Upload response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`🔴 Upload xətası: Status=${res.status}, StatusText=${res.statusText}, Error=${errorText}`);

      let errorMessage = `Şəkil yüklənmədi (${res.status})`;
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }
      }

      return {
        success: false,
        message: errorMessage,
        data: "",
        statusCode: res.status,
        errors: [errorText || "Upload failed"]
      };
    }

    const result = await res.json();
    console.log("✅ Upload uğurlu:", result);
    return result;
  } catch (error) {
    console.error("Upload Error:", error);
    return {
      success: false,
      message: "Şəkil yükləmə xətası: " + (error as Error).message,
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
  shortDescription: string;
  description?: string;
  mainImageUrl: string;
  galleryImageUrls: string[];
  categoryIds: number[];
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
  id: number;
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

// Çoxlu məhsul silmək
export async function bulkDeleteProducts(ids: number[]): Promise<ApiResponse<number>> {
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
    const res = await fetch(`${API_URL}/products/bulk`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ids)
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Məhsullar silinmədi: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Bulk delete failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Bulk Delete Products Error:", error);
    return {
      success: false,
      message: "Məhsullar silmə xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// ============================================
// CATEGORY CRUD OPERATIONS
// ============================================

export async function createCategory(data: {
  name: string;
  description: string;
  parentId?: number | null;
  imageUrl?: string;
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

export async function updateCategory(id: number, data: {
  id: number;
  name: string;
  description: string;
  parentId?: number | null;
  imageUrl?: string;
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

// Çoxlu kateqoriya silmək
export async function bulkDeleteCategories(ids: number[]): Promise<ApiResponse<number>> {
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
    const res = await fetch(`${API_URL}/categories/bulk`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ids)
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Kateqoriyalar silinmədi: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Bulk delete failed"]
      };
    }

    return await res.json();
  } catch (error) {
    console.error("Bulk Delete Categories Error:", error);
    return {
      success: false,
      message: "Kateqoriyalar silmə xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

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

// ============================================
// SHORT VIDEO CRUD OPERATIONS
// ============================================

export interface ShortVideoGetDto {
  id: number;
  isDeleted: boolean;
  createdDate: string;
  title: string;
  link: string;
  isActive: boolean;
}

export interface ShortVideoPostDto {
  title: string;
  createdDate: string;
  link: string;
  isActive: boolean;
}

export interface ShortVideoPutDto {
  id: number;
  title: string;
  link: string;
  isActive: boolean;
}

// Get all active short videos (public)
export async function getShortVideos(): Promise<ApiResponse<ShortVideoGetDto[]> | null> {
  try {
    const res = await fetch(`${API_URL}/shortvideo`, { cache: 'no-store' });
    if (!res.ok) return null;

    const result = await res.json();

    // Backend returns array directly, wrap it in ApiResponse format
    if (Array.isArray(result)) {
      return {
        success: true,
        data: result,
        message: "OK",
        statusCode: 200
      };
    }

    // If it's already in ApiResponse format
    return result;
  } catch (error) {
    console.error("ShortVideo Fetch Error:", error);
    return null;
  }
}

// Get short video by ID
export async function getShortVideoById(id: number): Promise<ApiResponse<ShortVideoGetDto> | null> {
  try {
    const res = await fetch(`${API_URL}/shortvideo/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;

    const result = await res.json();

    // Backend might return object directly, wrap it in ApiResponse format
    if (result && result.id !== undefined && result.success === undefined) {
      return {
        success: true,
        data: result,
        message: "OK",
        statusCode: 200
      };
    }

    return result;
  } catch (error) {
    console.error("ShortVideo Fetch Error:", error);
    return null;
  }
}

// Create short video
export async function createShortVideo(data: ShortVideoPostDto): Promise<ApiResponse<number>> {
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
    const res = await fetch(`${API_URL}/shortvideo`, {
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
        message: `Video yaradılmadı: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Create failed"]
      };
    }

    // Backend returns 201 with { message: "..." } - handle this case
    const result = await res.json();

    // If backend doesn't return success field, check status code
    if (result.success === undefined) {
      return {
        success: true,
        message: result.message || "Video yaradıldı",
        data: result.data || 0,
        statusCode: res.status
      };
    }

    return result;
  } catch (error) {
    console.error("Create ShortVideo Error:", error);
    return {
      success: false,
      message: "Video yaratma xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Update short video
export async function updateShortVideo(id: number, data: ShortVideoPutDto): Promise<ApiResponse<boolean>> {
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
    console.log("🟠 Updating Short Video Debug:", {
      url: `${API_URL}/shortvideo`,
      method: "PUT",
      data: data
    });

    const res = await fetch(`${API_URL}/shortvideo`, {
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
        message: `Video yenilənmədi: ${res.status} ${res.statusText}`,
        data: false,
        statusCode: res.status,
        errors: [errorText || "Update failed"]
      };
    }

    // Backend returns 204 No Content or simple response - handle this case
    const text = await res.text();
    if (!text) {
      return {
        success: true,
        message: "Video yeniləndi",
        data: true,
        statusCode: res.status
      };
    }

    const result = JSON.parse(text);
    if (result.success === undefined) {
      return {
        success: true,
        message: result.message || "Video yeniləndi",
        data: true,
        statusCode: res.status
      };
    }

    return result;
  } catch (error) {
    console.error("Update ShortVideo Error:", error);
    return {
      success: false,
      message: "Video yeniləmə xətası",
      data: false,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Delete short video
export async function deleteShortVideo(id: number): Promise<ApiResponse<null>> {
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
    const res = await fetch(`${API_URL}/shortvideo/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Video silinmədi: ${res.status} ${res.statusText}`,
        data: null,
        statusCode: res.status,
        errors: [errorText || "Delete failed"]
      };
    }

    // Backend returns 204 No Content - handle this case
    const text = await res.text();
    if (!text) {
      return {
        success: true,
        message: "Video silindi",
        data: null,
        statusCode: res.status
      };
    }

    const result = JSON.parse(text);
    if (result.success === undefined) {
      return {
        success: true,
        message: result.message || "Video silindi",
        data: null,
        statusCode: res.status
      };
    }

    return result;
  } catch (error) {
    console.error("Delete ShortVideo Error:", error);
    return {
      success: false,
      message: "Video silmə xətası",
      data: null,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// Çoxlu video silmək
export async function bulkDeleteShortVideos(ids: number[]): Promise<ApiResponse<number>> {
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
    const res = await fetch(`${API_URL}/shortvideo/bulk`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ids)
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        message: `Videolar silinmədi: ${res.status} ${res.statusText}`,
        data: 0,
        statusCode: res.status,
        errors: [errorText || "Bulk delete failed"]
      };
    }

    const text = await res.text();
    if (!text) {
      return {
        success: true,
        message: "Videolar silindi",
        data: ids.length,
        statusCode: res.status
      };
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Bulk Delete ShortVideos Error:", error);
    return {
      success: false,
      message: "Videolar silmə xətası",
      data: 0,
      statusCode: 500,
      errors: [(error as Error).message]
    };
  }
}

// ============================================
// AUDIT LOG / HISTORY
// ============================================

import { AuditLog } from "@/types";

// Get history for a specific record
export async function getHistory(tableName: string, recordId: string | number): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_URL}/History?tableName=${tableName}&recordId=${recordId}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error("History fetch error:", res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("History Fetch Error:", error);
    return [];
  }
}

// Get recent activity across all tables (for dashboard)
export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  try {
    // Fetch history for common tables (using plural table names as in database)
    const [productHistory, categoryHistory, videoHistory] = await Promise.all([
      fetch(`${API_URL}/History?tableName=Products&recordId=0`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/History?tableName=Categories&recordId=0`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_URL}/History?tableName=ShortVideos&recordId=0`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]);

    // Combine and sort by date
    const allLogs: AuditLog[] = [
      ...(Array.isArray(productHistory) ? productHistory : []),
      ...(Array.isArray(categoryHistory) ? categoryHistory : []),
      ...(Array.isArray(videoHistory) ? videoHistory : [])
    ];

    // Sort by dateTime descending and limit
    return allLogs
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Recent Activity Fetch Error:", error);
    return [];
  }
}