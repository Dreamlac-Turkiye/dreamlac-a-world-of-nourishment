/**
 * Kurumsal bilgiler — tek kaynak.
 * Bileşenlerde elle tekrarlanmaz; ileride admin panelinden / backend'den okunacak.
 * Kaynak: firmanın resmî kataloğu.
 */
export const company = {
  legalName: "Kulalac",
  brand: "Dreamlac",
  foundedFrance: "2014",
  foundedTurkey: "2020",
  address: "Zaferiye Mah. Kayrak Küme Evler No: 47 İç Kapı No: 1 Kula / Manisa, Türkiye",
  city: "Kula, Manisa",
  phone: "+90 212 495 03 33",
  mobile: "+90 532 060 27 22",
  email: "info@kulalac.com",
  website: "www.kulalac.com",
  websiteUrl: "https://www.kulalac.com",
  /** Henüz iletilmeyen kurumsal alanlar — doldurulmadan gösterilmez. */
  taxOffice: null as string | null,
  taxId: null as string | null,
  tradeRegistryNo: null as string | null,
  foodBusinessRegistrationNo: null as string | null,
  /** Sosyal medya bağlantıları iletilmedi → boş bırakıldı, arayüzde gizlenir. */
  social: [] as { label: string; url: string }[],
} as const;
