/**
 * Merkezi metin katmanı (TR).
 * Çoklu dil desteği (AR / RTL, EN) eklenirken bu dosyanın yapısı kopyalanır:
 * src/content/ar.ts, src/content/en.ts + src/content/index.ts içinde seçim.
 * Bileşenlerin içine sabit metin yazılmaz; hepsi buradan okunur.
 *
 * Bu dosyadaki ürün, kalite ve kurumsal metinler firmanın resmî kataloğundan
 * alınan ONAYLI metinlerdir. Onaysız iddia, sertifika veya sağlık beyanı eklenmez.
 */
export const tr = {
  brand: {
    name: "Dreamlac",
    logoNote: "Logo alanı",
    tagline: "Bebek ve devam sütleri",
    manufacturer: "Kulalac",
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
    eyebrow: "Kulalac üretimi",
    title: "Her Adımda Özenle Yanınızda",
    description:
      "Dreamlac 1, 2 ve 3 ürünlerini keşfedin; ürün bilgilerine kolayca ulaşın ve güvenli bir alışveriş deneyimi yaşayın.",
    primaryCta: "Ürünleri Keşfet",
    secondaryCta: "Dreamlac’ı Tanıyın",
    notice:
      "Anne sütü bebekler için en uygun besindir. Ürün kullanımı hakkında sağlık profesyonelinize danışınız.",
    visualNote: "Dreamlac 1, 2 ve 3 ürün ambalajları",
    scrollHint: "Aşağı kaydırın",
  },
  products: {
    sectionEyebrow: "Ürün Ailesi",
    sectionTitle: "Dreamlac Ürünlerini Keşfedin",
    sectionDescription: "Farklı gelişim dönemlerine yönelik Dreamlac ürünlerini inceleyin.",
    detailsCta: "Detayları Gör",
    addToCart: "Sepete Ekle",
    favorite: "Favorilere ekle",
    imageMissing: "Ambalaj görseli yakında",
    fields: {
      age: "Yaş dönemi",
      weight: "Gramaj",
      price: "Fiyat",
      type: "Ürün türü",
      base: "Süt bazı",
    },
    placeholders: {
      weight: "Gramaj bilgisi yakında",
      price: "Fiyat yakında",
    },
    stock: {
      inStock: "Stokta",
      outOfStock: "Stokta yok",
      pending: "Stok bilgisi hazırlanıyor",
    },
    allProducts: "Tüm Ürünler",
  },
  story: {
    eyebrow: "Hikâyemiz",
    title: "Bilimle Başlayan, Özenle Devam Eden Bir Yolculuk",
    description:
      "2014 yılında Fransa’da başlayan bilgi ve deneyim yolculuğu, 2020 yılında Türkiye’de yerel üretim gücüyle buluştu.",
    headline: "Her damlanın ardında, sağlıklı bir yaşam için verilen emeğin hikâyesi var.",
    paragraphs: [
      "Dreamlac’ın yolculuğu; bilimi, özeni ve ailelerin ihtiyaçlarını aynı noktada buluşturma hedefiyle başladı. Kulalac, modern üretim teknolojilerini uluslararası kalite yaklaşımıyla bir araya getirerek çocuk beslenmesine yönelik ürünler geliştirmektedir.",
      "2014 yılında Fransa’da başlayan bilgi ve deneyim yolculuğu, 2020 yılında Türkiye’de yerel üretim gücüyle yeni bir aşamaya taşındı. Bugün Kula, Manisa’daki üretim tesisimizde kalite, izlenebilirlik ve ürün güvenliğini üretimin her aşamasının merkezinde tutuyoruz.",
    ],
    cta: "Hikâyemizi Keşfedin",
    missionTitle: "Yalnızca ürün geliştirmiyoruz, yaşamın ilk adımlarına özenle eşlik ediyoruz.",
    missionText:
      "Dreamlac ürünleri; bilimsel yaklaşım, modern üretim teknolojileri ve özenle seçilen bileşenler doğrultusunda geliştirilmektedir. Üretim sürecinin her aşamasında kalite ve ürün güvenliği esas alınır.",
  },
  ingredients: {
    eyebrow: "Formüller",
    title: "Dreamlac Formüllerini Tanıyın",
    description: "Dreamlac 1, 2 ve 3 ürünlerinde yer alan öne çıkan bileşenleri inceleyin.",
    featuresTitle: "Formül Özellikleri",
    features: ["Palm Yağı İçermez", "GDO İçermez"],
    note: "Bileşenlere ilişkin ayrıntılı bilgiler ürün ambalajında yer almaktadır.",
  },
  chooser: {
    eyebrow: "Ürün Karşılaştırma",
    title: "Ürün seçeneklerini inceleyin",
    description:
      "Dreamlac 1, 2 ve 3 ürünlerinin genel özelliklerini yan yana görebilirsiniz. Bu alan bir öneri veya teşhis aracı değildir.",
    disclaimer:
      "Bu karşılaştırma genel ürün bilgisi sunmak amacıyla hazırlanmıştır. Bebeğiniz veya çocuğunuz için ürün seçmeden önce sağlık profesyonelinize danışınız.",
    featureColumn: "Özellik",
  },
  journey: {
    eyebrow: "Üretim Yolculuğu",
    title: "Üretimin Her Aşamasında Kalite ve İzlenebilirlik",
    description:
      "Dreamlac ürünlerinin yolculuğu, hammaddelerin değerlendirilmesiyle başlar ve üretim, kalite kontrol, paketleme ve izlenebilirlik adımlarıyla devam eder. Amaç, her aşamada tutarlı bir kalite ve ürün güvenliği yaklaşımı sağlamaktır.",
    steps: [
      "Hammadde Seçimi",
      "Üretim Süreci",
      "Kalite Kontrol",
      "Paketleme",
      "İzlenebilirlik",
      "Tüketiciye Ulaşım",
    ],
  },
  quality: {
    eyebrow: "Kalite Yaklaşımımız",
    title: "Hammaddeden Pakete Uzanan Kalite Yaklaşımı",
    description:
      "Üretimin her aşamasında kalite, ürün güvenliği ve izlenebilirlik yaklaşımını merkeze alıyoruz.",
    intro:
      "Hammaddelerin tedarikinden ürünlerin paketlenmesine kadar tüm üretim aşamaları kalite kontrol süreçleri doğrultusunda takip edilir. Kulalac, üretim bilgisini ve modern teknolojiyi Türkiye’de bir araya getirerek güvenilir ve izlenebilir bir üretim yaklaşımı benimser.",
    items: [
      {
        title: "Hammadde Kontrolü",
        description:
          "Üretimde kullanılan hammaddeler, tanımlanmış kalite süreçleri doğrultusunda değerlendirilir.",
      },
      {
        title: "Modern Üretim Teknolojisi",
        description:
          "Üretim sürecinde modern teknolojilerden ve spray-drying yönteminden yararlanılır.",
      },
      {
        title: "Süreç Kontrolü",
        description:
          "Üretimin farklı aşamalarında kalite ve uygunluk kontrolleri gerçekleştirilir.",
      },
      {
        title: "Paketleme",
        description:
          "Ürünler, içeriğin korunmasına yardımcı olacak ambalajlama süreçleriyle hazırlanır.",
      },
      {
        title: "İzlenebilirlik",
        description:
          "Üretim lotlarının ve ürün hareketlerinin izlenebilirliği kalite sisteminin önemli bir parçasıdır.",
      },
      {
        title: "Sürekli Gelişim",
        description:
          "Kalite süreçleri, mevzuat ve üretim ihtiyaçları doğrultusunda düzenli olarak değerlendirilir.",
      },
    ],
    certificatesTitle: "Kalite Belgeleri",
    certificatesNote:
      "Üretim ve kalite yönetimi süreçleri, aşağıdaki uluslararası standartlar kapsamında yürütülmektedir. Belge kopyaları talep üzerine paylaşılır.",
    certificates: ["FSSC 22000", "ISO 22000", "ISO 9001", "GMP", "FDA"],
    cta: "Kalite ve Güvenlik",
  },
  factory: {
    eyebrow: "Üretim Tesisi",
    title: "Türkiye’de Üretim",
    description: "Dreamlac ürünleri, Kulalac’ın Kula, Manisa’daki üretim tesisinde üretilmektedir.",
  },
  trust: {
    eyebrow: "Neden Dreamlac?",
    title: "Sade, şeffaf ve güven veren bir deneyim",
    description: "Ürün bilgilerine kolay erişim ve anlaşılır bir alışveriş akışı esas alınır.",
    items: [
      {
        title: "Şeffaf Ürün Bilgileri",
        description:
          "Ürün bilgileri açık ve okunabilir bir düzende sunulur; ayrıntılar ürün ambalajında yer alır.",
      },
      {
        title: "Güvenli Alışveriş",
        description:
          "Sipariş adımları anlaşılır, bilgileriniz özenle korunacak şekilde tasarlanır.",
      },
      {
        title: "Özenli Paketleme",
        description:
          "Ürünler, içeriğin korunmasına yardımcı olacak ambalajlama süreçleriyle hazırlanır.",
      },
      {
        title: "Müşteri Desteği",
        description: "Sorularınız için iletişim kanalları tek bir yerde toplanır.",
      },
    ],
  },
  content: {
    eyebrow: "Bilgi Merkezi",
    title: "Aileler için hazırlanan içerikler",
    description:
      "Aşağıdaki başlıklar yer tutucudur. İçerik metinleri onaylandıktan sonra yayınlanacaktır.",
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
  contact: {
    title: "Bizimle İletişime Geçin",
    description:
      "Dreamlac ürünleri, sipariş süreci veya genel bilgilendirme talepleriniz için bizimle iletişime geçebilirsiniz.",
  },
  footer: {
    about:
      "Dreamlac, Kulalac tarafından geliştirilen bebek ve devam sütü ürünlerini şeffaf bir dijital deneyimle sunar.",
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
    },
    social: {
      title: "Sosyal Medya",
      note: "Sosyal medya bağlantıları eklenecek",
    },
    rights: "Tüm hakları saklıdır.",
    notice:
      "Anne sütü bebekler için en uygun besindir. Ürün seçimi ve kullanımı hakkında sağlık profesyonelinize danışınız.",
    disclaimer:
      "Bu site bir arayüz çalışmasıdır. Fiyatlar, gramajlar ve yasal metinler onaylandıktan sonra yayınlanacaktır.",
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
  productDetail: {
    breadcrumbHome: "Ana Sayfa",
    breadcrumbProducts: "Ürünler",
    listTitle: "Dreamlac Ürünleri",
    listDescription:
      "Dreamlac 1, Dreamlac 2 ve Dreamlac 3 ürünlerinin bilgilerini inceleyin. Ürün seçimi hakkında sağlık profesyonelinize danışınız.",
    notFoundTitle: "Ürün bulunamadı",
    notFoundDescription: "Aradığınız ürün mevcut değil. Dreamlac ürünlerini inceleyebilirsiniz.",
    backToProducts: "Ürünlere dön",
    quantity: "Adet",
    increase: "Adet artır",
    decrease: "Adet azalt",
    maxQuantityNote: "Tek siparişte en fazla 10 adet seçilebilir.",
    salesClosedTitle: "Bu ürün için çevrim içi satış henüz açık değil",
    salesClosedText:
      "Fiyat, gramaj ve satış bilgileri tarafımıza iletildikten sonra sipariş alanı etkinleştirilecektir.",
    pricePending: "Fiyat bilgisi hazırlanıyor",
    previewSaleNote:
      "Sipariş akışı şu anda önizleme olarak çalışır: ürünü sepete ekleyip ödeme adımlarını uçtan uca görebilirsiniz. Tutarlar, resmî fiyat bilgisi tarafımıza iletildikten sonra görüntülenecektir.",
    outOfStockText: "Ürün şu anda stokta bulunmuyor.",
    notifyMe: "Stoğa gelince haber ver",
    ingredientsTitle: "Öne çıkan bileşenler",
    featuresTitle: "Formül özellikleri",
    infoPendingTitle: "Bilgi bekleniyor",
    tabs: {
      details: "Ürün Detayı",
      preparation: "Hazırlama",
      nutrition: "Besin Değerleri",
    },
    detailsFields: {
      technicalName: "Ürün tanımı",
      age: "Yaş dönemi",
      base: "Süt bazı",
      baseValue: "İnek sütü bazlı",
      weight: "Gramaj",
      sku: "Ürün kodu",
      barcode: "Barkod",
      producer: "Üretici",
      origin: "Üretim yeri",
    },
    preparationPending:
      "Hazırlama talimatı ve ölçek/dozaj bilgileri, ürün etiketindeki resmî metin tarafımıza iletildikten sonra bu alanda yayınlanacaktır. Hazırlama ve dozaj konusunda ürün ambalajındaki talimatı ve sağlık profesyonelinizin önerisini esas alınız.",
    nutritionPending:
      "Besin değerleri tablosu, resmî etiket verileri tarafımıza iletildikten sonra bu alanda yayınlanacaktır. Uydurma değer gösterilmez.",
    nutritionColumns: {
      nutrient: "Besin öğesi",
      per100g: "100 g toz üründe",
      per100ml: "Hazırlanmış 100 ml’de",
    },
    nutritionLabel: {
      title: "Besin değerleri etiket şablonu",
      unitColumn: "Birim",
      pendingBadge: "Değerler bekleniyor",
      readyBadge: "Resmî değerler yayında",
      note: "Bu şablon, ürün etiketinde yer alan besin öğesi satırlarının düzenini gösterir. Değerler yalnızca resmî etiket verileri tarafımıza iletildikten sonra doldurulur; tahmini veya uydurma değer gösterilmez. Bebeğinizin beslenmesi hakkında sağlık profesyonelinize danışınız.",
      compactNote:
        "Kısaltılmış görünüm. Tüm besin öğesi satırlarını Besin Değerleri sekmesinde görebilirsiniz.",
      progress: "Şablon durumu: {total} satırın {filled} tanesi resmî veriyle dolu.",
    },
    storageTitle: "Saklama koşulları",
    allergensTitle: "Alerjen bilgisi",
    shelfLifeTitle: "Raf ömrü",
    fullIngredientsTitle: "Tam bileşen listesi",
    pendingShort: "Bilgi hazırlanıyor",
    warningTitle: "Önemli bilgilendirme",
    relatedTitle: "Diğer Dreamlac ürünleri",
  },
  cart: {
    title: "Sepetim",
    description: "Sepetinizdeki Dreamlac ürünlerini gözden geçirin ve ödeme adımlarına geçin.",
    emptyTitle: "Sepetiniz şu anda boş",
    emptyDescription:
      "Dreamlac 1, 2 ve 3 ürünlerini inceleyip sepetinize ekleyebilirsiniz. Ürün seçimi hakkında sağlık profesyonelinize danışınız.",
    emptyCta: "Ürünleri incele",
    continueShopping: "Alışverişe devam et",
    remove: "Ürünü sepetten çıkar",
    removed: "Ürün sepetten çıkarıldı.",
    added: "Ürün sepete eklendi.",
    clear: "Sepeti boşalt",
    cleared: "Sepet boşaltıldı.",
    lineTotal: "Satır toplamı",
    summaryTitle: "Sipariş Özeti",
    subtotal: "Ara toplam",
    shipping: "Kargo",
    total: "Genel toplam",
    pendingPrice: "Fiyat bilgisi hazırlanıyor",
    pendingShipping: "Kargo bilgisi hazırlanıyor",
    pendingTotal: "Toplam, fiyat bilgisi tamamlandığında hesaplanacaktır.",
    checkoutCta: "Ödeme adımına geç",
    previewNotice:
      "Çevrim içi satış henüz açık değildir. Sepet ve ödeme adımları, akışı göstermek amacıyla önizleme olarak çalışır; ürün fiyatları ve kargo bilgileri tarafımıza iletildikten sonra sipariş alınmaya başlanacaktır.",
    itemCount: "ürün",
  },
  checkout: {
    title: "Ödeme",
    description: "Teslimat, kargo, ödeme ve onay adımlarını tamamlayın.",
    previewNotice:
      "Bu akış bir önizlemedir. Gerçek ödeme alınmaz, kart bilgisi istenmez ve sipariş kaydı oluşturulmaz.",
    steps: {
      address: "Teslimat Bilgileri",
      shipping: "Kargo Seçeneği",
      payment: "Ödeme Yöntemi",
      review: "Onay",
    },
    stepLabel: "Adım",
    next: "Devam et",
    back: "Geri",
    emptyTitle: "Ödeme adımına geçmek için sepetinizde ürün olmalıdır",
    emptyCta: "Ürünleri incele",
    form: {
      fullName: "Ad Soyad",
      phone: "Telefon",
      email: "E-posta",
      city: "İl",
      district: "İlçe",
      addressLine: "Adres",
      note: "Sipariş notu (isteğe bağlı)",
      cityPlaceholder: "Örn. İstanbul",
      districtPlaceholder: "Örn. Kadıköy",
      addressPlaceholder: "Mahalle, sokak, bina ve daire bilgisi",
      notePlaceholder: "Teslimat için iletmek istediğiniz not",
      phonePlaceholder: "05XX XXX XX XX",
      emailPlaceholder: "ornek@eposta.com",
    },
    errors: {
      required: "Bu alan zorunludur.",
      fullNameShort: "Ad ve soyadınızı girin.",
      phoneInvalid: "Geçerli bir telefon numarası girin.",
      emailInvalid: "Geçerli bir e-posta adresi girin.",
      addressShort: "Adresi daha ayrıntılı yazın.",
      tooLong: "Girdiğiniz metin çok uzun.",
      shippingRequired: "Bir kargo seçeneği seçin.",
      paymentRequired: "Bir ödeme yöntemi seçin.",
      consentRequired: "Devam etmek için yasal metinleri onaylamanız gerekir.",
    },
    shippingTitle: "Kargo seçeneğini belirleyin",
    shippingNote:
      "Kargo ücreti ve teslimat süresi, anlaşmalı kargo bilgileri tarafımıza iletildikten sonra bu alanda gösterilecektir.",
    paymentTitle: "Ödeme yöntemini seçin",
    paymentNote:
      "Ödeme altyapısı bağlanmadığı için bu adımda kart bilgisi istenmez ve herhangi bir tahsilat yapılmaz.",
    paymentUnavailable: "Bu yöntem henüz kullanılamıyor",
    reviewTitle: "Siparişinizi onaylayın",
    reviewAddress: "Teslimat bilgileri",
    reviewShipping: "Kargo",
    reviewPayment: "Ödeme yöntemi",
    reviewItems: "Ürünler",
    edit: "Düzenle",
    consent: "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu’nu okudum, onaylıyorum.",
    submit: "Siparişi tamamla (önizleme)",
    submitting: "İşleniyor…",
    successTitle: "Önizleme siparişi oluşturuldu",
    successDescription:
      "Bu bir önizleme kaydıdır; gerçek bir sipariş oluşturulmamış ve ödeme alınmamıştır.",
    orderNumber: "Sipariş numarası",
    trackCta: "Sipariş takip sayfası",
    homeCta: "Ana sayfaya dön",
    ordersCta: "Siparişlerime git",
    savedNotice: "Sipariş kaydınız hesabınıza eklendi; Siparişlerim sayfasından görebilirsiniz.",
    guestNotice:
      "Siparişinizin hesabınıza kaydedilmesi için giriş yapmanız gerekir. Şu anda yalnızca önizleme numarası oluşturuldu.",
    signInCta: "Giriş yap",
    saveError: "Sipariş kaydedilemedi. Lütfen tekrar deneyin.",
  },
  account: {
    title: "Hesabım",
    description:
      "Hesap bilgilerinizi görüntüleyin, siparişlerinizi takip edin ve oturumunuzu yönetin.",
    signedInAs: "Giriş yapan hesap",
    signOut: "Çıkış yap",
    ordersTitle: "Siparişlerim",
    ordersDescription: "Oluşturduğunuz sipariş kayıtlarını ve detaylarını görüntüleyin.",
    adminDescription: "Ürün fiyatı, gramaj ve bileşen bilgilerini yönetin.",
  },
  orders: {
    title: "Siparişlerim",
    description: "Hesabınıza kaydedilen sipariş kayıtları burada listelenir.",
    emptyTitle: "Henüz sipariş kaydınız yok",
    emptyDescription: "Sepetinize ürün ekleyip ödeme adımlarını tamamladığınızda burada görünür.",
    emptyCta: "Ürünleri incele",
    error: "Sipariş kayıtları alınamadı. Lütfen tekrar deneyin.",
    detailDescription: "Sipariş satırları, tutarlar ve teslimat bilgileri.",
    backToList: "Siparişlerime dön",
    notFoundTitle: "Sipariş bulunamadı",
    notFoundDescription: "Bu sipariş numarası hesabınıza ait değil ya da kaldırılmış olabilir.",
    itemsTitle: "Ürünler",
    summaryTitle: "Tutarlar",
    deliveryTitle: "Teslimat bilgileri",
    quantity: "Adet",
    shippingOption: "Kargo seçeneği",
    paymentMethod: "Ödeme yöntemi",
    previewNotice:
      "Çevrim içi satış henüz açık değildir. Bu kayıtlar akışı göstermek amacıyla önizleme olarak saklanır; tahsilat yapılmaz.",
  },

  auth: {
    title: "Giriş Yap",
    description: "Yönetim paneline erişmek için hesabınızla giriş yapın.",
    signInTab: "Giriş yap",
    signUpTab: "Hesap oluştur",
    email: "E-posta",
    password: "Şifre",
    signIn: "Giriş yap",
    signUp: "Hesap oluştur",
    google: "Google ile devam et",
    signOut: "Çıkış yap",
    signedInAs: "Giriş yapan hesap",
    signUpSuccess:
      "Hesap oluşturuldu. E-posta doğrulaması gerekiyorsa gelen kutunuzu kontrol edin.",
    signInError: "Giriş yapılamadı. E-posta ve şifrenizi kontrol edin.",
    signUpError: "Hesap oluşturulamadı.",
    loading: "İşleniyor…",
    passwordHint: "En az 8 karakter kullanın.",
  },
  admin: {
    navLabel: "Yönetim",
    title: "Ürün Yönetimi",
    description:
      "Dreamlac 1, 2 ve 3 için fiyat, gramaj ve bileşen listesini buradan girin. Girdiğiniz bilgiler ürün sayfalarında, sepette ve ödeme adımlarında anında kullanılır.",
    noAccessTitle: "Bu alana erişim yetkiniz yok",
    noAccessDescription:
      "Ürün yönetimi yalnızca yönetici rolüne sahip hesaplarla kullanılabilir. Yetki tanımlanması için bizimle iletişime geçin.",
    fields: {
      price: "Fiyat (₺)",
      pricePlaceholder: "Örn. 249,90",
      weight: "Gramaj",
      weightPlaceholder: "Örn. 400 g",
      ingredients: "Bileşen listesi",
      ingredientsHint: "Her satıra bir bileşen yazın. Etiketteki resmî metni birebir kullanın.",
      stock: "Stok durumu",
      directSale: "Çevrim içi satışı aç",
      directSaleHint: "Fiyat girilmeden satış açılamaz.",
      note: "Yönetici notu (isteğe bağlı)",
    },
    stockOptions: {
      in_stock: "Stokta",
      out_of_stock: "Stokta yok",
      pending: "Hazırlanıyor",
    },
    save: "Kaydet",
    saving: "Kaydediliyor…",
    saved: "Ürün bilgileri kaydedildi.",
    saveError: "Kaydedilemedi. Lütfen tekrar deneyin.",
    priceInvalid: "Geçerli bir fiyat girin.",
    priceRequiredForSale: "Satışı açmak için önce fiyat girin.",
    lastUpdated: "Son güncelleme",
    emptyPrice: "Fiyat girilmedi",
    responsibility:
      "Bu alana yalnızca resmî ürün etiketinde ve firma kayıtlarında yer alan bilgileri girin. Girilen bilgiler müşterilere gösterilir.",
    legal: {
      title: "Yasal Metin Yönetimi",
      description:
        "KVKK Aydınlatma Metni, Gizlilik Politikası, Çerez Politikası ve Mesafeli Satış Sözleşmesi metinleri buradan düzenlenir. Kaydettiğiniz metin ilgili yasal sayfada anında yayınlanır.",
      notice:
        "Metinler mevzuata uygun taslak olarak hazırlanmıştır. Yayına almadan önce hukuk danışmanınıza kontrol ettirmeniz önerilir.",
      fields: {
        title: "Sayfa başlığı",
        summary: "Kısa açıklama",
        effectiveDate: "Yürürlük tarihi",
        body: "Metin",
        bodyHint:
          'Başlık için satır başına "## ", madde işareti için "- ", vurgulu ifade için **metin** yazabilirsiniz. Boş satır yeni paragraf başlatır.',
      },
      view: "Sayfayı görüntüle",
      saved: "Yasal metin kaydedildi.",
      saveError: "Yasal metin kaydedilemedi. Lütfen tekrar deneyin.",
      titleRequired: "Sayfa başlığı boş bırakılamaz.",
      bodyRequired: "Metin boş bırakılamaz.",
    },
  },
  legal: {
    effectiveDate: "Yürürlük tarihi",
    lastUpdated: "Son güncelleme",
    empty:
      "Bu sayfanın metni henüz yayınlanmadı. Metin yönetim panelinden kaydedildiğinde burada görüntülenecektir.",
  },
  common: {
    soon: "Yakında",
    placeholder: "Yer tutucu",
    skipToContent: "İçeriğe geç",
  },
} as const;

export type Dictionary = typeof tr;
