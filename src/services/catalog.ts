import {
  mockArticles,
  mockComparisonRows,
  mockFaqs,
  mockIngredientCards,
  mockProductionSteps,
  mockQualityItems,
  mockTrustItems,
} from "@/data/mock/content";
import { mockProducts } from "@/data/mock/products";
import { listProductSettings, type ProductSettingRecord } from "@/lib/product-settings.functions";
import type {
  Article,
  ComparisonRow,
  FaqItem,
  IngredientCard,
  NewsletterSubscription,
  Product,
  ProductionStep,
  QualityItem,
  TrustItem,
} from "@/types";

/**
 * Servis katmanı — arayüz bu fonksiyonlara bağlıdır, mock veriye değil.
 * Backend hazır olduğunda yalnızca bu dosyanın gövdesi değiştirilir
 * (örn. Supabase sorgusu veya REST çağrısı) — bileşenlere dokunulmaz.
 */

/**
 * Ürünün onaylı katalog metinleri mock veriden gelir; ticari alanlar
 * (fiyat, gramaj, bileşen listesi, stok, satış durumu) yönetim panelinden
 * girilen kayıtlarla birleştirilir. Yönetimde veri yoksa alan boş kalır.
 */
function mergeSettings(product: Product, setting?: ProductSettingRecord): Product {
  if (!setting) return product;
  return {
    ...product,
    price: { ...product.price, amount: setting.priceKurus ?? product.price.amount },
    weight: setting.weight ?? product.weight,
    ingredientsList: setting.ingredients.length > 0 ? setting.ingredients : product.ingredientsList,
    stock: setting.stock,
    directSaleEnabled: setting.directSaleEnabled,
  };
}

export async function getProducts(): Promise<Product[]> {
  const settings = await listProductSettings();
  const bySlug = new Map(settings.map((s) => [s.slug, s]));
  return mockProducts.map((product) => mergeSettings(product, bySlug.get(product.slug)));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) return null;
  const settings = await listProductSettings();
  return mergeSettings(
    product,
    settings.find((s) => s.slug === slug),
  );
}

export async function getArticles(): Promise<Article[]> {
  return mockArticles;
}

export function getTrustItems(): TrustItem[] {
  return mockTrustItems;
}

export function getQualityItems(): QualityItem[] {
  return mockQualityItems;
}

export function getIngredientCards(): IngredientCard[] {
  return mockIngredientCards;
}

export function getProductionSteps(): ProductionStep[] {
  return mockProductionSteps;
}

export function getComparisonRows(): ComparisonRow[] {
  return mockComparisonRows;
}

export function getFaqs(): FaqItem[] {
  return mockFaqs;
}

/** TODO(backend): gerçek bülten kaydı. Şu an yalnızca arayüz doğrulaması yapar. */
export async function subscribeToNewsletter(_input: NewsletterSubscription): Promise<void> {
  return;
}
