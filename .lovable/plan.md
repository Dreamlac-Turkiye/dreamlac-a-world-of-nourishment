# Aşama 3 — Sepet ve Çok Adımlı Ödeme (Checkout)

Dreamlac 1 / 2 / 3 ürünlerine bağlı bir sepet ve 4 adımlı ödeme akışı. Satış açılana kadar akış "önizleme/kilitli" modda çalışır; fiyat ve gramaj bilgisi geldiğinde tek bir ayar ile satışa açılır.

## Kapsam

**Sepet sayfası (`/sepet`)**
- Ürün satırları: paket görseli, ürün adı, aşama/yaş, adet seçici (maks. 10), satır silme
- Boş sepet durumu ve "Ürünlere dön" bağlantısı
- Özet kartı: ara toplam, kargo, genel toplam
- Fiyat verisi olmayan ürünler için tutar yerine "Fiyat bilgisi hazırlanıyor" görünür — uydurma tutar yazılmaz

**Ödeme akışı (`/odeme`) — 4 adım**
1. Teslimat bilgileri (ad, telefon, e-posta, il/ilçe, adres)
2. Kargo seçeneği
3. Ödeme yöntemi (yalnızca arayüz — gerçek tahsilat yok, test/demo etiketi görünür)
4. Onay: sipariş özeti + yasal onaylar (Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu)

Adım göstergesi, ileri/geri gezinme, her adımda alan doğrulama, sayfa yenilenince ilerlemenin korunması. Son adımda sipariş numarası üretilir ve sipariş takip sayfasına bağlanır.

**Satış kilidi**
- Ürünlerde `directSaleEnabled` kapalı olduğu için "Sepete Ekle" pasif kalır; sepet ve ödeme sayfaları örnek akış olarak gezilebilir ve neden kapalı olduğu açıkça yazılır
- Fiyat/gramaj bilgisi gelince tek bayrak açılınca akış tam çalışır hale gelir

## Teknik notlar

- Sepet durumu için React context + reducer; kalıcılık tarayıcı deposunda yalnızca sepet satırları (ürün kodu + adet) olarak tutulur, veritabanı yerine kullanılmaz
- Sipariş oluşturma `src/services/checkout.ts` içinde mock servis olarak yazılır; gerçek backend geldiğinde yalnızca bu dosya değişir
- Tüm Türkçe metinler `src/content/tr.ts` içinde `cart` ve `checkout` bölümlerine eklenir
- Form doğrulaması `react-hook-form` + `zod`; alan hataları Türkçe
- Yeni dosyalar: `src/context/CartContext.tsx`, `src/services/checkout.ts`, `src/components/cart/*`, `src/components/checkout/*`, `src/routes/odeme.tsx`, güncellenen `src/routes/sepet.tsx`
- Gerçek ödeme entegrasyonu, gerçek kargo fiyatı, KDV oranı ve teslimat süresi bu aşamada yazılmaz — resmî bilgi gelmeden uydurulmaz

## Bu aşamada yapılmayacaklar

- Gerçek para tahsilatı veya banka/kart entegrasyonu
- Üyelik/hesap işlemleri (Aşama 4)
- Kargo firması API bağlantısı
