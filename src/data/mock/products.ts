import type { Product } from "@/types";
import dreamlac1Image from "@/assets/dreamlac-1-cutout.png";
import dreamlac2Image from "@/assets/dreamlac-2-cutout.png";
import dreamlac3Image from "@/assets/dreamlac-3-cutout.png";

/**
 * GEÇİCİ MOCK VERİ — backend bağlanınca silinecek.
 * Fiyat / yaş / gramaj bilgileri kasıtlı olarak null bırakılmıştır.
 * Orijinal ambalaj görselleri şeffaf arka planla bağlanmıştır.
 */
export const mockProducts: Product[] = [
  {
    id: "p-dreamlac-1",
    slug: "dreamlac-1",
    sku: "DL-001",
    name: "Dreamlac 1",
    shortDescription:
      "Dreamlac ürün ailesinin ilk basamağı. Ürün açıklaması onayınızla güncellenecek.",
    stage: "stage-1",
    ageRange: null,
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: dreamlac1Image, alt: "Dreamlac 1 ürün ambalajı" },
    packagingNote: "Dreamlac 1 orijinal ambalajı",
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
    image: { src: dreamlac2Image, alt: "Dreamlac 2 ürün ambalajı" },
    packagingNote: "Dreamlac 2 orijinal ambalajı",
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
    image: { src: dreamlac3Image, alt: "Dreamlac 3 ürün ambalajı" },
    packagingNote: "Dreamlac 3 orijinal ambalajı",
  },
];
