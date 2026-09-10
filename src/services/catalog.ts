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

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return mockProducts.find((p) => p.slug === slug) ?? null;
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
