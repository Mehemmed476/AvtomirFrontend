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
  stockQuantity?: number;       // Stok miqdarı

  // --- YENİ ƏLAVƏ OLUNANLAR (Detail Page Üçün) ---
  imageUrls?: string[];         // Əlavə şəkillər
  sku?: string;                 // Məhsul Kodu
  shortDescription?: string;    // Qısa məlumat
  description?: string;         // Tam məlumat (HTML ola bilər)
  whatsAppLink?: string;        // WhatsApp linki
  metaTitle?: string;           // SEO Title
  metaDescription?: string;     // SEO Description
  videoLink?: string;           // Video Link
}

// Admin Panel üçün məhsul detay tipi (ProductListDto + əlavə sahələr)
export interface ProductDetailDto {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  mainImageUrl: string;
  imageUrls?: string[];  // Gallery şəkilləri
  galleryImageUrls?: string[];  // Backend alias (imageUrls ilə eynidir)
  isNew: boolean;
  isInStock: boolean;
  isActive?: boolean;  // Məhsulun aktiv/passiv statusu
  brandId?: number;  // Brend ID
  brandName?: string;
  categoryIds?: number[];  // Kateqoriya ID-ləri
  sku?: string;
  shortDescription?: string;
  description?: string;
  whatsAppLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  videoLink?: string;
  showPrice?: boolean;
  priceText?: string;
  discountRate?: number;
  stockQuantity?: number;
  categories?: CategoryTreeDto[];  // DEĞİŞTİ: Category[] → CategoryTreeDto[]
}

// Backend-dəki "PagedList" wrapper-i
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  statusCode: number;
  errors?: string[] | null; // <--- BU SƏTRİ ƏLAVƏ ET
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
  slug: string;  // ƏLAVƏ EDİLDİ
  description?: string;
  imageUrl?: string;  // ƏLAVƏ EDİLDİ
  parentId?: number;
  children?: Category[];
}

// ============================================
// YENİ BACKEND DTO'LARI
// ============================================

// Backend ProductListDto - list görünümü üçün
export interface ProductListDto {
  id: number;
  name: string;
  slug: string;
  mainImageUrl: string;
  brandName: string;
  price: number;
  oldPrice?: number;
  showPrice: boolean;       // Fiyat göster/gösterme
  priceText: string;        // "123.45 ₼" və ya "Qiymət soruşun"
  discountRate: number;     // İndirim yüzdesi (0-100)
  isNew: boolean;
  isInStock: boolean;
  stockQuantity?: number;
}

// Backend CategoryTreeDto - hierarchical menü üçün
export interface CategoryTreeDto {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  children?: CategoryTreeDto[];  // Recursive alt kateqoriyalar
}

// Backend CategoryDetailDto - detay sayfası üçün
export interface CategoryDetailDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
}

// Backend CategoryListDto - düz liste üçün
export interface CategoryListDto {
  id: number;
  name: string;
  slug: string;
}