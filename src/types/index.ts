// Backend-dəki "ProductListDto" ilə eynidir
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  discountRate: number;
  mainImageUrl: string;
  isNew: boolean;
  isInStock: boolean;
  brandName?: string;
  
  // --- YENİ ƏLAVƏ OLUNANLAR (Detail Page Üçün) ---
  imageUrls?: string[];         // Əlavə şəkillər
  sku?: string;                 // Məhsul Kodu
  shortDescription?: string;    // Qısa məlumat
  description?: string;         // Tam məlumat (HTML ola bilər)
  whatsAppLink?: string;        // WhatsApp linki
  metaTitle?: string;           // SEO Title
  metaDescription?: string;     // SEO Description
}

// Backend-dəki "PagedList" wrapper-i
export interface PagedResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

// Backend-dəki "ServiceResponse" wrapper-i
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  statusCode: number;
}

// Axtarış üçün parametrlər (Frontdan göndərilən)
export interface ProductParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  children?: Category[]; // Əgər alt kateqoriyalar varsa
}

export interface SiteSettings {
  Phone: string;
  Email: string;
  Address: string;
  MapUrl: string;
  Facebook: string;
  Instagram: string;
  Whatsapp: string;
  WorkHours: string;
}