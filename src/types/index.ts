/** Ortak veri tipleri. Backend geliştirmesi bu sözleşmeleri karşılamalıdır. */

export type StageKey = "stage-1" | "stage-2" | "stage-3";

export type StockStatus = "in_stock" | "out_of_stock" | "pending";

export interface Money {
  /** Kuruş cinsinden tam sayı. Değer henüz belli değilse null. */
  amount: number | null;
  currency: "TRY";
}

export interface ProductImage {
  src: string | null;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  /** SKU henüz iletilmedi → null. Arayüzde gizlenir. */
  sku: string | null;
  /** Barkod henüz iletilmedi → null. */
  barcode: string | null;
  name: string;
  /** Ör. "1. Aşama Bebek Formülü" */
  technicalName: string;
  /** Katalogdan onaylı kısa açıklama. */
  shortDescription: string;
  /** Katalogdan onaylı tanıtım metni. */
  description: string;
  stage: StageKey;
  /** Katalogdan onaylı yaş dönemi. */
  ageRange: string;
  /** Gramaj bilgisi henüz yok → null. */
  weight: string | null;
  price: Money;
  stock: StockStatus;
  image: ProductImage;
  /** Katalogda belirtilen öne çıkan bileşenler. */
  highlightedIngredients: string[];
  /** Ör. "Palm yağı içermez", "GDO içermez" */
  formulaFeatures: string[];
  /** Ürün sayfasında ve satın alma alanının yanında gösterilecek zorunlu uyarı. */
  warning: string;
  /** Doğrudan satış hukuki inceleme sonrası açılacak (admin panelinden kontrol edilir). */
  directSaleEnabled: boolean;
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

export interface IngredientCard {
  id: string;
  title: string;
  description: string;
}

export interface ProductionStep {
  id: string;
  title: string;
}

export interface ComparisonRow {
  label: string;
  values: [string, string, string];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface NewsletterSubscription {
  email: string;
  marketingConsent: boolean;
}

export type AsyncState = "loading" | "success" | "empty" | "error";
