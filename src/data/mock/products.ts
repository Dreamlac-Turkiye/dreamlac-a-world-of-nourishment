import type { Product } from "@/types";
import dreamlac1Image from "@/assets/dreamlac-1-cutout.png";
import dreamlac2Image from "@/assets/dreamlac-2-cutout.png";
import dreamlac3Image from "@/assets/dreamlac-3-cutout.png";

/**
 * Ürün verisi — metinler firmanın resmî kataloğundan alınan ONAYLI içeriklerdir.
 * Backend bağlanınca bu dosya yerine servis katmanı gerçek veriyi döndürür.
 *
 * BİLEREK BOŞ (null) bırakılan alanlar — bilgi iletilmeden doldurulmaz:
 * fiyat, gramaj, SKU, barkod, stok, besin değerleri, hazırlama talimatı,
 * alerjen bilgisi, saklama koşulları, raf ömrü.
 */

const SHARED_INGREDIENTS = [
  "DHA",
  "ARA",
  "Nükleotidler",
  "Lutein",
  "Karotenoidler",
  "Bifidobacterium lactis",
  "GOS ve FOS prebiyotik lifleri",
];

const SHARED_FEATURES = ["Palm yağı içermez", "GDO içermez"];

export const mockProducts: Product[] = [
  {
    id: "10000000-0000-4000-8000-000000000011",
    slug: "dreamlac-1",
    sku: null,
    barcode: null,
    name: "Dreamlac 1 Bebek Sütü",
    technicalName: "1. Aşama Bebek Formülü",
    shortDescription:
      "Doğumdan itibaren ilk 6 aylık döneme yönelik, inek sütü bazlı bebek formülü.",
    description:
      "Dreamlac 1, yaşamın ilk 6 aylık dönemine yönelik olarak geliştirilmiş, inek sütü bazlı bir bebek formülüdür. Formülünde DHA, ARA, nükleotidler, lutein, karotenoidler, Bifidobacterium lactis ile GOS ve FOS prebiyotik lifleri bulunmaktadır.",
    stage: "stage-1",
    ageRange: "Doğumdan itibaren ilk 6 ay",
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: dreamlac1Image, alt: "Dreamlac 1 Bebek Sütü ürün ambalajı" },
    highlightedIngredients: SHARED_INGREDIENTS,
    formulaFeatures: SHARED_FEATURES,
    warning:
      "Anne sütü bebekler için en uygun besindir. Dreamlac 1 yalnızca sağlık profesyonelinin önerisi doğrultusunda kullanılmalıdır. Ürünün kullanımı, hazırlanması ve bebeğinizin beslenmesi hakkında doktorunuza danışınız.",
    /** Hukuki inceleme tamamlanana kadar doğrudan satış kapalı. */
    directSaleEnabled: false,
    ingredientsList: null,
    nutrition: null,
    preparation: null,
    allergens: null,
    storage: null,
    shelfLife: null,
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    slug: "dreamlac-2",
    sku: null,
    barcode: null,
    name: "Dreamlac 2 Devam Sütü",
    technicalName: "2. Aşama Devam Formülü",
    shortDescription: "6-12 aylık döneme yönelik, inek sütü bazlı devam formülü.",
    description:
      "Dreamlac 2, 6-12 aylık döneme yönelik olarak geliştirilmiş, inek sütü bazlı bir devam formülüdür. Formülünde DHA, ARA, nükleotidler, lutein, karotenoidler, Bifidobacterium lactis ile GOS ve FOS prebiyotik lifleri bulunmaktadır.",
    stage: "stage-2",
    ageRange: "6-12 ay",
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: dreamlac2Image, alt: "Dreamlac 2 Devam Sütü ürün ambalajı" },
    highlightedIngredients: SHARED_INGREDIENTS,
    formulaFeatures: SHARED_FEATURES,
    warning:
      "Anne sütü bebekler için en uygun besindir. Devam sütleri, tamamlayıcı beslenmenin bir parçasıdır ve ilk 6 ay boyunca anne sütü yerine kullanılmamalıdır. Ürün seçimi ve kullanımı hakkında sağlık profesyonelinize danışınız.",
    directSaleEnabled: false,
    ingredientsList: null,
    nutrition: null,
    preparation: null,
    allergens: null,
    storage: null,
    shelfLife: null,
  },
  {
    id: "10000000-0000-4000-8000-000000000013",
    slug: "dreamlac-3",
    sku: null,
    barcode: null,
    name: "Dreamlac 3 Devam Sütü",
    technicalName: "3. Aşama Devam Formülü",
    shortDescription:
      "12-36 aylık çocukların beslenme dönemine yönelik, inek sütü bazlı devam formülü.",
    description:
      "Dreamlac 3, 12-36 aylık döneme yönelik olarak geliştirilmiş, inek sütü bazlı bir devam formülüdür. Formülünde DHA, ARA, nükleotidler, lutein, karotenoidler, Bifidobacterium lactis ile GOS ve FOS prebiyotik lifleri bulunmaktadır.",
    stage: "stage-3",
    ageRange: "12-36 ay",
    weight: null,
    price: { amount: null, currency: "TRY" },
    stock: "pending",
    image: { src: dreamlac3Image, alt: "Dreamlac 3 Devam Sütü ürün ambalajı" },
    highlightedIngredients: SHARED_INGREDIENTS,
    formulaFeatures: SHARED_FEATURES,
    warning:
      "Anne sütü çocukların beslenmesinde önemli bir yere sahiptir. Dreamlac 3, çeşitli ve dengeli beslenmenin yerine geçmez. Çocuğunuzun beslenme ihtiyaçları ve ürün kullanımı hakkında sağlık profesyonelinize danışınız.",
    directSaleEnabled: false,
    ingredientsList: null,
    nutrition: null,
    preparation: null,
    allergens: null,
    storage: null,
    shelfLife: null,
  },
];
