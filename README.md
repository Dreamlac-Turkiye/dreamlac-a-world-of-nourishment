# Dreamlac — Web Arayüzü (Aşama 1)

Türkiye pazarı için hazırlanan Dreamlac bebek maması platformunun arayüz projesi.
Bu depo yalnızca **frontend** içerir; backend başka bir geliştirici tarafından eklenecektir.

## Teknoloji

- TanStack Start v1 (React 19, TypeScript, Vite)
- TanStack Router (dosya tabanlı yönlendirme) + TanStack Query
- Tailwind CSS v4 (tüm tasarım token’ları `src/styles.css` içinde)
- shadcn/ui bileşenleri (`src/components/ui`)

```bash
bun install
bun run dev      # http://localhost:8080
bun run build
bun run lint
```

## Klasör yapısı

```
src/
  content/tr.ts          # TÜM arayüz metinleri (çoklu dil için tek nokta)
  data/mock/             # GEÇİCİ mock veri — backend bağlanınca silinecek
  services/catalog.ts    # Servis katmanı — backend yalnızca burayı değiştirir
  types/index.ts         # Veri tipleri / API sözleşmesi
  components/
    brand/               # LogoPlaceholder, Icon3D (3D ikon sarmalayıcı)
    common/              # SectionHeading, EmptyState, PagePlaceholder
    layout/              # Header (+ mobil menü), Footer, CookieBanner
    product/             # ProductCard, ProductCardSkeleton, PackShotPlaceholder
    home/                # Hero, ProductShowcase, TrustSection, ChooserSection,
                         # QualitySection, ContentSection, Newsletter
  routes/                # Sayfalar (dosya adı = URL)
  styles.css             # Design system: renk, gradyan, gölge, radius, animasyon
```

## Değiştirilecek yer tutucular

| Konu | Dosya | Yapılacak |
| --- | --- | --- |
| Resmî logo | `src/components/brand/LogoPlaceholder.tsx` | Logoyu `src/assets/brand/` içine ekleyip bileşen içeriğini `<img>` ile değiştirin |
| Ambalaj görselleri | `src/data/mock/products.ts` → `image.src` | Orijinal görselleri `src/assets/products/` altına ekleyip yolu yazın |
| Yaş / gramaj / fiyat | `src/data/mock/products.ts` | `null` alanları gerçek verilerle doldurun |
| Marka renkleri | `src/styles.css` → `:root` | Logo renkleri belirlenince yalnızca burayı güncelleyin |
| Metinler | `src/content/tr.ts` | Onaylı metinlerle değiştirin |
| Yasal metinler | `src/routes/*politikasi.tsx`, `kvkk.tsx` vb. | Onaylı metinleri yerleştirin |

## Çoklu dil hazırlığı

Tüm metinler `src/content/tr.ts` içindedir. Arapça (RTL) ve İngilizce için aynı yapıda
`ar.ts` / `en.ts` eklenip seçim katmanı yazılması yeterlidir; bileşenler değişmez.
RTL için `<html dir>` değeri `src/routes/__root.tsx` içinde ayarlanır.

## Backend’e bağlanacak noktalar (TODO)

- `src/services/catalog.ts` → ürünler, içerikler, bülten kaydı
- Sepet / favori işlemleri (şu an yalnızca arayüz durumu)
- Çerez onayı kaydı (`CookieBanner`, şu an tarayıcıda tutuluyor)

Gizli anahtar depoya eklenmez; örnek değişkenler `.env.example` dosyasındadır.

## Aşama durumu

- [x] Aşama 1 — Design system, Header, Mobil menü, Footer, Ana sayfa, Çerez bildirimi
- [ ] Aşama 2 — Ürün listesi ve ürün detay sayfaları
- [ ] Aşama 3 — Sepet ve ödeme akışı
- [ ] Aşama 4 — Üyelik ve müşteri paneli
- [ ] Aşama 5 — Kurumsal, içerik ve yasal sayfalar
- [ ] Aşama 6 — Yönetim paneli
- [ ] Aşama 7 — Son kontrol ve teslim

Diğer tüm menü/footer bağlantıları şu an “hazırlanıyor” iskeleti gösterir; ilgili aşamada tasarlanacaktır.
