/** Ortak veri tipleri. Backend geliştirmesi bu sözleşmeleri karşılamalıdır. */

export type StageKey = "stage-1" | "stage-2" | "stage-3";

export type StockStatus = "in_stock" | "out_of_stock" | "pending";

export interface Money {
  /** Kuruş cinsinden tam sayı. Değer henüz belli değilse null. */
  amount: number | null;
  currency: "TRY";
}

export interface ProductImage {
  /** Orijinal ambalaj görseli buraya bağlanacak (şu an null). */
  src: string | null;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  /** Kısa, geçici tanıtım metni. Onaylı metinle değiştirilecek. */
  shortDescription: string;
  stage: StageKey;
  /** Yaş aralığı bilgisi henüz yok → null. */
  ageRange: string | null;
  /** Gramaj bilgisi henüz yok → null. */
  weight: string | null;
  price: Money;
  stock: StockStatus;
  image: ProductImage;
  packagingNote: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string | null;
  publishedAt: string | null;
}

export interface TrustItem {
  id: string;
  title: string;
  description: string;
  icon: "info" | "shield" | "package" | "support";
}

export interface QualityItem {
  id: string;
  title: string;
  description: string;
}

export interface NewsletterSubscription {
  email: string;
  marketingConsent: boolean;
}

export type AsyncState = "loading" | "success" | "empty" | "error";
