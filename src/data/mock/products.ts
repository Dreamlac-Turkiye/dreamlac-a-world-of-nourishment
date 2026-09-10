import type { Product } from "@/types";

/**
 * GEÇİCİ MOCK VERİ — backend bağlanınca silinecek.
 * Fiyat / yaş / gramaj bilgileri kasıtlı olarak null bırakılmıştır.
 * Ambalaj görselleri iletildiğinde `image.src` alanına eklenecek
 * (öneri: src/assets/products/dreamlac-1.png ...).
 */
export const mockProducts: Product[] = [
  {
    id: "p-dreamlac-1",
    slug: "dreamlac-1",
    sku: "DL-001",
    name: "Dreamlac 1",
    shortDescription: "Dreamlac ürün ailesinin ilk basamağı. Ürün açıklaması onayınızla güncellenecek.",
    stage: "stage-1",
    ageRange: null,
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: null, alt: "Dreamlac 1 ambalaj görseli" },
    packagingNote: "Orijinal ambalaj görseli bekleniyor",
  },
  {
    id: "p-dreamlac-2",
    slug: "dreamlac-2",
    sku: "DL-002",
    name: "Dreamlac 2",
    shortDescription: "Ürün ailesinin ikinci basamağı. Açıklama metni tarafınızdan iletilecek.",
    stage: "stage-2",
    ageRange: null,
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: null, alt: "Dreamlac 2 ambalaj görseli" },
    packagingNote: "Orijinal ambalaj görseli bekleniyor",
  },
  {
    id: "p-dreamlac-3",
    slug: "dreamlac-3",
    sku: "DL-003",
    name: "Dreamlac 3",
    shortDescription: "Ürün ailesinin üçüncü basamağı. Açıklama metni tarafınızdan iletilecek.",
    stage: "stage-3",
    ageRange: null,
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: null, alt: "Dreamlac 3 ambalaj görseli" },
    packagingNote: "Orijinal ambalaj görseli bekleniyor",
  },
];
