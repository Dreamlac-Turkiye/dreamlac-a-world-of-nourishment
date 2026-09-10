/**
 * Merkezi metin katmanı (TR).
 * Çoklu dil desteği (AR / RTL, EN) eklenirken bu dosyanın yapısı kopyalanır:
 * src/content/ar.ts, src/content/en.ts + src/content/index.ts içinde seçim.
 * Bileşenlerin içine sabit metin yazılmaz; hepsi buradan okunur.
 */
export const tr = {
  brand: {
    name: "Dreamlac",
    logoNote: "Logo alanı",
    tagline: "Bebek maması ürünleri",
  },
  nav: {
    home: "Ana Sayfa",
    products: "Ürünler",
    about: "Hakkımızda",
    quality: "Kalite ve Güvenlik",
    knowledge: "Bilgi Merkezi",
    faq: "Sıkça Sorulan Sorular",
    contact: "İletişim",
    search: "Ara",
    account: "Hesabım",
    cart: "Sepet",
    menu: "Menü",
    close: "Kapat",
    openMenu: "Menüyü aç",
  },
  hero: {
    eyebrow: "Türkiye için özenle hazırlanıyor",
    title: "Her Adımda Özenle Yanınızda",
    description:
      "Dreamlac ürünlerini keşfedin, ürün bilgilerine kolayca ulaşın ve aileniz için güvenli bir alışveriş deneyimi yaşayın.",
    primaryCta: "Ürünleri Keşfet",
    secondaryCta: "Dreamlac’ı Tanıyın",
    visualNote: "Dreamlac 1, 2 ve 3 ambalaj görselleri için ayrılmış alan",
    scrollHint: "Aşağı kaydırın",
  },
  products: {
    sectionEyebrow: "Ürün Ailesi",
    sectionTitle: "Dreamlac Ürünleri",
    sectionDescription:
      "Üç ürün, tek bir özen anlayışı. Ürün bilgileri tarafınızdan iletildiğinde bu alanlar otomatik olarak güncellenecek şekilde hazırlandı.",
    detailsCta: "Detayları Gör",
    addToCart: "Sepete Ekle",
    favorite: "Favorilere ekle",
    imageMissing: "Ambalaj görseli yakında",
    placeholders: {
      age: "Yaş bilgisi daha sonra eklenecek",
      weight: "Gramaj bilgisi",
      price: "Fiyat yakında",
    },
    stock: {
      inStock: "Stokta",
      outOfStock: "Stokta yok",
      pending: "Stok bilgisi hazırlanıyor",
    },
    allProducts: "Tüm Ürünler",
  },
  trust: {
    eyebrow: "Neden Dreamlac?",
    title: "Sade, şeffaf ve güven veren bir deneyim",
    description:
      "Aşağıdaki başlıklar, onaylı metinleriniz iletildiğinde güncellenmek üzere genel ifadelerle hazırlandı.",
    items: [
      {
        title: "Şeffaf Ürün Bilgileri",
        description:
          "Ürün detayları, içindekiler ve besin değerleri açık ve okunabilir bir düzende sunulur.",
      },
      {
        title: "Güvenli Alışveriş",
        description:
          "Sipariş adımları anlaşılır, bilgileriniz özenle korunacak şekilde tasarlanır.",
      },
      {
        title: "Özenli Paketleme",
        description:
          "Ürünlerin size ulaşana kadar korunması için paketleme akışı öncelikli tutulur.",
      },
      {
        title: "Müşteri Desteği",
        description: "Sorularınız için iletişim kanalları tek bir yerde toplanır.",
      },
    ],
  },
  chooser: {
    eyebrow: "Ürün Seçenekleri",
    title: "Ürün seçeneklerini inceleyin",
    description:
      "Dreamlac 1, 2 ve 3 arasındaki farkları yan yana görebilirsiniz. Bu alan bir öneri aracı değildir.",
    disclaimer: "Ürün seçimi ve kullanımıyla ilgili olarak sağlık uzmanınıza danışınız.",
    columnLabels: {
      stage: "Ürün",
      age: "Yaş aralığı",
      weight: "Gramaj",
      pack: "Ambalaj",
    },
  },
  quality: {
    eyebrow: "Kalite ve Güvenlik",
    title: "Kalite yaklaşımımız için ayrılmış alan",
    description:
      "Kalite süreçleri, izlenebilirlik ve üretim bilgileri; tarafınızdan onaylanan belgeler iletildiğinde bu bölümde yayınlanacaktır.",
    items: [
      { title: "Kalite Süreçleri", description: "Süreç açıklaması için hazır alan." },
      { title: "Güvenlik Adımları", description: "Güvenlik bilgisi için hazır alan." },
      { title: "İzlenebilirlik", description: "Parti ve izlenebilirlik bilgisi için hazır alan." },
      { title: "Saklama Koşulları", description: "Saklama bilgisi için hazır alan." },
      { title: "Üretim Bilgisi", description: "Üretim bilgisi için hazır alan." },
      { title: "Belgeler", description: "Yalnızca tarafınızca iletilen belgeler yayınlanır." },
    ],
    note: "Bu bölümde yer alacak tüm ifadeler ve belgeler onayınıza tabidir.",
    cta: "Kalite ve Güvenlik",
  },
  content: {
    eyebrow: "Bilgi Merkezi",
    title: "Aileler için hazırlanan içerikler",
    description:
      "Aşağıdaki başlıklar yer tutucudur. İçerik metinleri tarafınızdan iletildiğinde yayınlanacaktır.",
    readMore: "Yazıyı oku",
    allArticles: "Tüm içerikler",
    comingSoon: "İçerik hazırlanıyor",
  },
  newsletter: {
    eyebrow: "Bülten",
    title: "Yeniliklerden haberdar olun",
    description: "E-posta adresinizi bırakın, Dreamlac ile ilgili gelişmeleri sizinle paylaşalım.",
    emailLabel: "E-posta adresiniz",
    emailPlaceholder: "ornek@eposta.com",
    submit: "Kaydol",
    consent:
      "Ticari elektronik ileti almayı ve bilgilerimin bu kapsamda işlenmesini kabul ediyorum.",
    consentRequired: "Devam etmek için ticari elektronik ileti onayını işaretlemeniz gerekir.",
    invalidEmail: "Lütfen geçerli bir e-posta adresi girin.",
    success: "Kaydınız alındı. Teşekkür ederiz.",
    privacyNote: "Onayınızı istediğiniz zaman geri alabilirsiniz.",
  },
  cookie: {
    title: "Çerez tercihleri",
    description:
      "Deneyiminizi iyileştirmek için çerezler kullanılabilir. Tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.",
    accept: "Tümünü kabul et",
    reject: "Yalnızca gerekli",
    settings: "Çerez ayarları",
    policy: "Çerez Politikası",
  },
  footer: {
    about:
      "Dreamlac, Türkiye’deki aileler için hazırlanan bebek maması ürünlerini şeffaf bir dijital deneyimle sunmayı hedefler.",
    columns: {
      brand: "Dreamlac",
      shop: "Alışveriş",
      support: "Destek",
      legal: "Yasal Metinler",
    },
    links: {
      products: "Ürünler",
      about: "Hakkımızda",
      quality: "Kalite ve Güvenlik",
      knowledge: "Bilgi Merkezi",
      faq: "Sıkça Sorulan Sorular",
      contact: "İletişim",
      account: "Hesabım",
      orderTracking: "Sipariş Takip",
      shipping: "Teslimat Politikası",
      returns: "İade ve İptal Politikası",
      kvkk: "KVKK Aydınlatma Metni",
      privacy: "Gizlilik Politikası",
      cookies: "Çerez Politikası",
      distanceSales: "Mesafeli Satış Sözleşmesi",
      preInfo: "Ön Bilgilendirme Formu",
      membership: "Üyelik Sözleşmesi",
      cookieSettings: "Çerez Ayarları",
      commercialMessages: "Ticari Elektronik İleti Onayı",
    },
    company: {
      title: "Şirket Bilgileri",
      name: "Şirket unvanı bilgisi eklenecek",
      address: "Adres bilgisi eklenecek",
      phone: "Telefon bilgisi eklenecek",
      email: "E-posta bilgisi eklenecek",
      taxId: "Vergi bilgisi eklenecek",
    },
    social: {
      title: "Sosyal Medya",
      note: "Sosyal medya bağlantıları eklenecek",
    },
    rights: "Tüm hakları saklıdır.",
    disclaimer:
      "Bu site tanıtım amaçlı bir arayüz çalışmasıdır. Ürün bilgileri, fiyatlar ve yasal metinler onaylandıktan sonra yayınlanacaktır.",
  },
  states: {
    loading: "Yükleniyor…",
    empty: "Şu anda gösterilecek içerik yok.",
    error: "Bir sorun oluştu. Lütfen tekrar deneyin.",
    retry: "Tekrar dene",
    networkError: "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.",
    imageMissing: "Görsel bulunamadı",
    contentMissing: "İçerik henüz eklenmedi",
  },
  common: {
    soon: "Yakında",
    placeholder: "Yer tutucu",
    skipToContent: "İçeriğe geç",
  },
} as const;

export type Dictionary = typeof tr;
