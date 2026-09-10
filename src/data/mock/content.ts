import type {
  Article,
  ComparisonRow,
  FaqItem,
  IngredientCard,
  ProductionStep,
  QualityItem,
  TrustItem,
} from "@/types";

/**
 * İçerik verisi.
 * Ürün / kalite / SSS metinleri firmanın resmî kataloğundan alınan ONAYLI metinlerdir.
 * Bilgi merkezi makaleleri hâlâ yer tutucudur (onaylı metin bekleniyor).
 */

export const mockTrustItems: TrustItem[] = [
  { id: "t-1", title: "Şeffaf Ürün Bilgileri", description: "", icon: "info" },
  { id: "t-2", title: "Güvenli Alışveriş", description: "", icon: "shield" },
  { id: "t-3", title: "Özenli Paketleme", description: "", icon: "package" },
  { id: "t-4", title: "Müşteri Desteği", description: "", icon: "support" },
];

export const mockQualityItems: QualityItem[] = [
  {
    id: "q-1",
    title: "Hammadde Kontrolü",
    description:
      "Üretimde kullanılan hammaddeler, tanımlanmış kalite süreçleri doğrultusunda değerlendirilir.",
  },
  {
    id: "q-2",
    title: "Modern Üretim Teknolojisi",
    description: "Üretim sürecinde modern teknolojilerden ve spray-drying yönteminden yararlanılır.",
  },
  {
    id: "q-3",
    title: "Süreç Kontrolü",
    description: "Üretimin farklı aşamalarında kalite ve uygunluk kontrolleri gerçekleştirilir.",
  },
  {
    id: "q-4",
    title: "Paketleme",
    description: "Ürünler, içeriğin korunmasına yardımcı olacak ambalajlama süreçleriyle hazırlanır.",
  },
  {
    id: "q-5",
    title: "İzlenebilirlik",
    description:
      "Üretim lotlarının ve ürün hareketlerinin izlenebilirliği kalite sisteminin önemli bir parçasıdır.",
  },
  {
    id: "q-6",
    title: "Sürekli Gelişim",
    description:
      "Kalite süreçleri, mevzuat ve üretim ihtiyaçları doğrultusunda düzenli olarak değerlendirilir.",
  },
];

export const mockIngredientCards: IngredientCard[] = [
  {
    id: "i-1",
    title: "DHA ve ARA",
    description:
      "Dreamlac formüllerinde uzun zincirli yağ asitleri DHA ve ARA bulunmaktadır.",
  },
  { id: "i-2", title: "Nükleotidler", description: "Dreamlac formülleri nükleotidler içermektedir." },
  {
    id: "i-3",
    title: "Lutein ve Karotenoidler",
    description: "Formüllerde lutein ve karotenoidler yer almaktadır.",
  },
  {
    id: "i-4",
    title: "Bifidobacterium lactis",
    description: "Dreamlac 1, 2 ve 3 formüllerinde Bifidobacterium lactis bulunmaktadır.",
  },
  {
    id: "i-5",
    title: "GOS ve FOS",
    description: "Ürünler GOS ve FOS prebiyotik lifleri içermektedir.",
  },
];

export const mockProductionSteps: ProductionStep[] = [
  { id: "s-1", title: "Hammadde Seçimi" },
  { id: "s-2", title: "Üretim Süreci" },
  { id: "s-3", title: "Kalite Kontrol" },
  { id: "s-4", title: "Paketleme" },
  { id: "s-5", title: "İzlenebilirlik" },
  { id: "s-6", title: "Tüketiciye Ulaşım" },
];

/** Katalogdaki karşılaştırma tablosu — yalnızca verilen değerler. */
export const mockComparisonRows: ComparisonRow[] = [
  { label: "Ürün türü", values: ["Bebek formülü", "Devam formülü", "Devam formülü"] },
  { label: "Yaş dönemi", values: ["İlk 6 ay", "6-12 ay", "12-36 ay"] },
  {
    label: "Süt bazı",
    values: ["İnek sütü bazlı", "İnek sütü bazlı", "İnek sütü bazlı"],
  },
  { label: "DHA ve ARA", values: ["Var", "Var", "Var"] },
  { label: "Nükleotidler", values: ["Var", "Var", "Var"] },
  { label: "Lutein ve karotenoidler", values: ["Var", "Var", "Var"] },
  { label: "Bifidobacterium lactis", values: ["Var", "Var", "Var"] },
  { label: "GOS ve FOS", values: ["Var", "Var", "Var"] },
  { label: "Palm yağı", values: ["İçermez", "İçermez", "İçermez"] },
  { label: "GDO", values: ["İçermez", "İçermez", "İçermez"] },
];

export const mockFaqs: FaqItem[] = [
  {
    id: "f-1",
    question: "Dreamlac ürünleri nerede üretilmektedir?",
    answer:
      "Dreamlac ürünleri, Kulalac’ın Kula, Manisa’daki üretim tesisinde üretilmektedir.",
  },
  {
    id: "f-2",
    question: "Dreamlac ürünleri hangi dönemlere yöneliktir?",
    answer:
      "Dreamlac 1 ilk 6 aylık döneme, Dreamlac 2 6-12 aylık döneme, Dreamlac 3 ise 12-36 aylık döneme yönelik olarak geliştirilmiştir. Ürün seçimi konusunda sağlık profesyonelinize danışınız.",
  },
  {
    id: "f-3",
    question: "Dreamlac ürünleri palm yağı içeriyor mu?",
    answer: "Dreamlac 1, Dreamlac 2 ve Dreamlac 3 palm yağı içermez.",
  },
  {
    id: "f-4",
    question: "Dreamlac ürünleri GDO içeriyor mu?",
    answer:
      "Dreamlac 1, Dreamlac 2 ve Dreamlac 3 için ürün bilgisi GDO içermediğini belirtmektedir.",
  },
  {
    id: "f-5",
    question: "Ürünleri nasıl hazırlamalıyım?",
    answer:
      "Hazırlama talimatları ürün ambalajında yer almaktadır. Ürünü hazırlamadan önce ambalaj üzerindeki talimatları dikkatle okuyunuz ve belirtilen ölçülere uyunuz.",
  },
  {
    id: "f-6",
    question: "Açılmış ürün nasıl saklanmalıdır?",
    answer:
      "Ürünün ambalajında belirtilen saklama koşullarını ve açıldıktan sonraki kullanım süresini takip ediniz. Ayrıntılı bilgiler ürün ambalajına göre güncellenecektir.",
  },
  {
    id: "f-7",
    question: "Hangi ürünün uygun olduğunu nasıl belirleyebilirim?",
    answer:
      "Her çocuğun beslenme ihtiyacı farklı olabilir. Ürün seçmeden veya ürünü değiştirmeden önce sağlık profesyonelinize danışınız.",
  },
  {
    id: "f-8",
    question: "Ürünlerin içeriğini nereden görebilirim?",
    answer:
      "Her ürünün içerik, alerjen ve besin değerleri bilgileri ürün detay sayfasında ve ürün ambalajında sunulacaktır.",
  },
];

/** YER TUTUCU — onaylı içerik metinleri bekleniyor. */
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
    excerpt: "Hazırlama adımları ambalaj bilgileri doğrultusunda yayınlanacaktır.",
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
