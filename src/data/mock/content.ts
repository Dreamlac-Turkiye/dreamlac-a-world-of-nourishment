import type { Article, QualityItem, TrustItem } from "@/types";

/** GEÇİCİ MOCK İÇERİK — onaylı metinler geldiğinde değiştirilecek. */

export const mockTrustItems: TrustItem[] = [
  { id: "t-1", title: "Şeffaf Ürün Bilgileri", description: "", icon: "info" },
  { id: "t-2", title: "Güvenli Alışveriş", description: "", icon: "shield" },
  { id: "t-3", title: "Özenli Paketleme", description: "", icon: "package" },
  { id: "t-4", title: "Müşteri Desteği", description: "", icon: "support" },
];

export const mockQualityItems: QualityItem[] = [
  { id: "q-1", title: "", description: "" },
  { id: "q-2", title: "", description: "" },
  { id: "q-3", title: "", description: "" },
  { id: "q-4", title: "", description: "" },
  { id: "q-5", title: "", description: "" },
  { id: "q-6", title: "", description: "" },
];

export const mockArticles: Article[] = [
  {
    id: "a-1",
    slug: "bebek-beslenmesi",
    title: "Bebek Beslenmesi",
    excerpt: "Bu içerik için onaylı metin bekleniyor. Yer tutucu açıklama.",
    category: "Beslenme",
    readingTime: null,
    publishedAt: null,
  },
  {
    id: "a-2",
    slug: "hazirlama-talimati",
    title: "Ürün Hazırlama",
    excerpt: "Hazırlama adımları tarafınızca onaylandıktan sonra yayınlanacaktır.",
    category: "Kullanım",
    readingTime: null,
    publishedAt: null,
  },
  {
    id: "a-3",
    slug: "saklama-ve-kullanim",
    title: "Saklama ve Kullanım",
    excerpt: "Saklama koşulları ile ilgili metin alanı hazır bekliyor.",
    category: "Kullanım",
    readingTime: null,
    publishedAt: null,
  },
  {
    id: "a-4",
    slug: "aileler-icin-notlar",
    title: "Aileler İçin Notlar",
    excerpt: "Aile deneyimine dair içerikler için yer tutucu.",
    category: "Aile",
    readingTime: null,
    publishedAt: null,
  },
];
