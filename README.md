# Dreamlac Commerce Platform

منظومة Dreamlac التجارية متعددة الأسواق. تركيا (`TR`) هي السوق الأول، مع قالب معطّل وجاهز للتخصيص للسعودية (`SA`). يستخدم Lovable لمعاينة الواجهات أثناء التطوير فقط ولا يُعد منصة التشغيل النهائية.

## التقنية

- TanStack Start، React 19، TypeScript وVite
- TanStack Router وTanStack Query
- Tailwind CSS وshadcn/ui
- Supabase/PostgreSQL للمصادقة والبيانات وRLS
- Cloudflare-compatible production build

## الوظائف الحالية

- كتالوج Dreamlac 1 و2 و3، السلة وCheckout متعدد الخطوات.
- إنشاء طلب ذري مع idempotency وحجز المخزون.
- حساب العميل والعناوين والطلبات والتتبع للزائر.
- الإلغاء والإرجاع، إدارة المخزون والمستخدمين.
- تجهيزات الدفع والشحن والفوترة والطوابير وWebhooks.
- إدارة إصدارات الوثائق القانونية وموافقات Checkout.
- سجل تدقيق، rate limits ومؤشرات صحة تشغيلية.

## التشغيل المحلي

```bash
npm install
npm run dev
```

الفحوصات المطلوبة قبل الدمج:

```bash
npm run typecheck
npm run lint
npm run check:commerce
npm run check:release
npm run build
```

انسخ `.env.example` إلى ملف البيئة المحلي وأدخل قيم بيئة التطوير. لا تُحفظ مفاتيح الخدمة أو أسرار المزودين في GitHub.

## البنية

- `src/routes`: صفحات العميل ولوحة الإدارة وواجهات API.
- `src/components`: مكونات الواجهة حسب المجال.
- `src/lib`: وظائف الخادم وعقود الاستخدام.
- `src/config/markets`: إعدادات كل سوق ودولة.
- `supabase/migrations`: المخطط والسياسات والدوال والترحيلات.
- `docs/ROADMAP_AR.md`: المرجع التنفيذي وحالة كل مرحلة.

## مصدر الحقيقة

جداول `commerce_orders` و`commerce_order_items` هي مصدر الحقيقة للطلبات. جداول `orders` و`order_items` القديمة متوقفة عن الاستخدام، وتبقى مؤقتاً فقط لحين التحقق من عدم وجود بيانات إنتاجية قبل إزالتها بترحيل آمن.

راجع [خارطة التنفيذ العربية](docs/ROADMAP_AR.md) قبل بدء أي مرحلة جديدة.
