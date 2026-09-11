/**
 * Entegrasyon kayıt defteri (Türkiye).
 *
 * Bu dosya yalnızca "hangi sağlayıcı hangi anahtarlara ihtiyaç duyuyor" bilgisini tutar.
 * Gizli anahtar DEĞERLERİ burada tutulmaz; güvenli anahtar deposunda saklanır ve
 * sunucu tarafında process.env üzerinden okunur. Bu sayede altyapı bugün hazır olur,
 * anahtarlar sağlayıcı sözleşmeleri tamamlandıkça tek tek eklenir.
 */

export type IntegrationCategory = "cargo" | "payment" | "invoice" | "sms";

export interface IntegrationSecretField {
  /** Güvenli anahtar deposunda kullanılacak ortam değişkeni adı. */
  env: string;
  /** Yönetim panelinde gösterilen açıklama. */
  label: string;
  /** Zorunlu olmayan alanlar (örn. özel API adresi) false olur. */
  required: boolean;
}

export interface IntegrationProvider {
  key: string;
  category: IntegrationCategory;
  displayName: string;
  /** Sağlayıcının ne için kullanıldığı — panelde gösterilir. */
  purpose: string;
  /** Anahtarların alınacağı panel/belge adresi (bilgi amaçlı). */
  docsUrl: string | null;
  secrets: IntegrationSecretField[];
}

export const integrationCategories: Record<
  IntegrationCategory,
  { title: string; description: string }
> = {
  cargo: {
    title: "Kargo",
    description:
      "Gönderi oluşturma, barkod alma ve kargo takibi. Sözleşmeli kargo firmasının API bilgileri gerekir.",
  },
  payment: {
    title: "Ödeme",
    description:
      "Kredi kartı tahsilatı ve 3D Secure akışı. Sanal POS / ödeme kuruluşu bilgileri gerekir.",
  },
  invoice: {
    title: "e-Fatura / Muhasebe",
    description:
      "Sipariş sonrası e-Arşiv veya e-Fatura düzenlenmesi. Muhasebe programı ya da özel entegratör bilgileri gerekir.",
  },
  sms: {
    title: "SMS / Bildirim",
    description: "Sipariş ve kargo bildirimleri için SMS gönderimi.",
  },
};

export const integrationProviders: IntegrationProvider[] = [
  {
    key: "yurtici",
    category: "cargo",
    displayName: "Yurtiçi Kargo",
    purpose: "Gönderi oluşturma ve takip (SOAP/REST servisleri).",
    docsUrl: "https://www.yurticikargo.com",
    secrets: [
      { env: "YURTICI_KARGO_USERNAME", label: "Servis kullanıcı adı", required: true },
      { env: "YURTICI_KARGO_PASSWORD", label: "Servis şifresi", required: true },
      { env: "YURTICI_KARGO_CUSTOMER_CODE", label: "Müşteri kodu", required: true },
    ],
  },
  {
    key: "aras",
    category: "cargo",
    displayName: "Aras Kargo",
    purpose: "Gönderi oluşturma ve takip.",
    docsUrl: "https://www.araskargo.com.tr",
    secrets: [
      { env: "ARAS_KARGO_USERNAME", label: "Servis kullanıcı adı", required: true },
      { env: "ARAS_KARGO_PASSWORD", label: "Servis şifresi", required: true },
      { env: "ARAS_KARGO_CUSTOMER_CODE", label: "Müşteri kodu", required: true },
    ],
  },
  {
    key: "mng",
    category: "cargo",
    displayName: "MNG Kargo",
    purpose: "Gönderi oluşturma ve takip (REST API).",
    docsUrl: "https://www.mngkargo.com.tr",
    secrets: [
      { env: "MNG_KARGO_CLIENT_ID", label: "Client ID", required: true },
      { env: "MNG_KARGO_CLIENT_SECRET", label: "Client Secret", required: true },
      { env: "MNG_KARGO_CUSTOMER_NUMBER", label: "Müşteri numarası", required: true },
    ],
  },
  {
    key: "ptt",
    category: "cargo",
    displayName: "PTT Kargo",
    purpose: "Gönderi oluşturma ve takip.",
    docsUrl: "https://www.ptt.gov.tr",
    secrets: [
      { env: "PTT_KARGO_USERNAME", label: "Servis kullanıcı adı", required: true },
      { env: "PTT_KARGO_PASSWORD", label: "Servis şifresi", required: true },
    ],
  },
  {
    key: "hepsijet",
    category: "cargo",
    displayName: "Hepsijet",
    purpose: "Aynı gün / hızlı teslimat gönderileri.",
    docsUrl: "https://www.hepsijet.com",
    secrets: [
      { env: "HEPSIJET_API_KEY", label: "API anahtarı", required: true },
      { env: "HEPSIJET_MERCHANT_ID", label: "Satıcı (merchant) kodu", required: true },
    ],
  },
  {
    key: "iyzico",
    category: "payment",
    displayName: "iyzico",
    purpose: "Kredi kartı tahsilatı, 3D Secure, taksit seçenekleri.",
    docsUrl: "https://dev.iyzipay.com",
    secrets: [
      { env: "IYZICO_API_KEY", label: "API Key", required: true },
      { env: "IYZICO_SECRET_KEY", label: "Secret Key", required: true },
      { env: "IYZICO_BASE_URL", label: "Servis adresi (sandbox/canlı)", required: false },
    ],
  },
  {
    key: "paytr",
    category: "payment",
    displayName: "PayTR",
    purpose: "Kredi kartı tahsilatı ve iFrame ödeme sayfası.",
    docsUrl: "https://dev.paytr.com",
    secrets: [
      { env: "PAYTR_MERCHANT_ID", label: "Mağaza numarası", required: true },
      { env: "PAYTR_MERCHANT_KEY", label: "Mağaza anahtarı", required: true },
      { env: "PAYTR_MERCHANT_SALT", label: "Mağaza salt değeri", required: true },
    ],
  },
  {
    key: "param",
    category: "payment",
    displayName: "Param",
    purpose: "Sanal POS tahsilatı ve 3D Secure.",
    docsUrl: "https://dev.param.com.tr",
    secrets: [
      { env: "PARAM_CLIENT_CODE", label: "Client kodu", required: true },
      { env: "PARAM_CLIENT_USERNAME", label: "Client kullanıcı adı", required: true },
      { env: "PARAM_CLIENT_PASSWORD", label: "Client şifresi", required: true },
      { env: "PARAM_GUID", label: "GUID", required: true },
    ],
  },
  {
    key: "parasut",
    category: "invoice",
    displayName: "Paraşüt (e-Fatura)",
    purpose: "Sipariş sonrası e-Arşiv / e-Fatura oluşturma ve müşteriye gönderme.",
    docsUrl: "https://apidocs.parasut.com",
    secrets: [
      { env: "PARASUT_CLIENT_ID", label: "Client ID", required: true },
      { env: "PARASUT_CLIENT_SECRET", label: "Client Secret", required: true },
      { env: "PARASUT_USERNAME", label: "Kullanıcı adı", required: true },
      { env: "PARASUT_PASSWORD", label: "Şifre", required: true },
      { env: "PARASUT_COMPANY_ID", label: "Firma numarası", required: true },
    ],
  },
  {
    key: "uyumsoft",
    category: "invoice",
    displayName: "Uyumsoft (e-Fatura)",
    purpose: "Özel entegratör üzerinden e-Fatura / e-Arşiv düzenleme.",
    docsUrl: "https://www.uyumsoft.com.tr",
    secrets: [
      { env: "UYUMSOFT_USERNAME", label: "Servis kullanıcı adı", required: true },
      { env: "UYUMSOFT_PASSWORD", label: "Servis şifresi", required: true },
    ],
  },
  {
    key: "netgsm",
    category: "sms",
    displayName: "Netgsm SMS",
    purpose: "Sipariş onayı ve kargo durumu SMS bildirimleri.",
    docsUrl: "https://www.netgsm.com.tr",
    secrets: [
      { env: "NETGSM_USERNAME", label: "Kullanıcı numarası", required: true },
      { env: "NETGSM_PASSWORD", label: "Şifre", required: true },
      { env: "NETGSM_SENDER_TITLE", label: "Mesaj başlığı", required: true },
    ],
  },
];

/** Kargo firmalarının durum bildirimi (webhook) için paylaşılan doğrulama anahtarı. */
export const CARGO_WEBHOOK_SECRET_ENV = "CARGO_WEBHOOK_SECRET";

export function getProvider(key: string): IntegrationProvider | null {
  return integrationProviders.find((provider) => provider.key === key) ?? null;
}
