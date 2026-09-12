/**
 * Entegrasyon sözleşmeleri (arayüzler).
 *
 * Uygulama kodu her zaman bu arayüzler üzerinden çalışır; hangi sağlayıcının
 * kullanıldığı yönetim panelinden seçilir. Anahtarlar eklendiğinde yalnızca
 * ilgili adaptörün gövdesi doldurulur, çağıran kod değişmez.
 */

export interface IntegrationResult<T> {
  ok: boolean;
  data: T | null;
  /** Kullanıcıya gösterilebilir Türkçe hata mesajı. */
  error: string | null;
  /** Anahtar/ayar eksikse true olur; akış "hazır değil" olarak ele alınır. */
  notConfigured?: boolean;
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
}

export interface CreateShipmentInput {
  orderNumber: string;
  address: ShippingAddressInput;
  itemCount: number;
  /** Kuruş cinsinden tahsil edilecek tutar (kapıda ödeme için). */
  codAmountKurus?: number | null;
}

export interface ShipmentRef {
  providerKey: string;
  trackingNumber: string;
  labelUrl: string | null;
}

export interface ShipmentStatus {
  providerKey: string;
  trackingNumber: string;
  status: string;
  statusDetail: string | null;
  occurredAt: string;
}

export interface CargoAdapter {
  key: string;
  createShipment(input: CreateShipmentInput): Promise<IntegrationResult<ShipmentRef>>;
  trackShipment(trackingNumber: string): Promise<IntegrationResult<ShipmentStatus>>;
}

export interface StartPaymentInput {
  orderNumber: string;
  amountKurus: number;
  currency: "TRY";
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  /** Ödeme sonrası dönülecek tam adres. */
  callbackUrl: string;
}

export interface PaymentSession {
  providerKey: string;
  /** Kullanıcının yönlendirileceği ödeme sayfası ya da iFrame adresi. */
  redirectUrl: string | null;
  /** Sağlayıcı tarafındaki işlem kimliği. */
  reference: string;
}

export interface PaymentVerification {
  providerKey: string;
  reference: string;
  status: "paid" | "failed" | "pending";
  amountKurus: number | null;
}

export interface PaymentAdapter {
  key: string;
  startPayment(input: StartPaymentInput): Promise<IntegrationResult<PaymentSession>>;
  verifyPayment(reference: string): Promise<IntegrationResult<PaymentVerification>>;
}

export interface InvoiceLineInput {
  name: string;
  quantity: number;
  unitPriceKurus: number;
  vatRate: number;
}

export interface CreateInvoiceInput {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  taxNumber?: string | null;
  taxOffice?: string | null;
  lines: InvoiceLineInput[];
}

export interface InvoiceRef {
  providerKey: string;
  invoiceNumber: string;
  pdfUrl: string | null;
}

export interface InvoiceAdapter {
  key: string;
  createInvoice(input: CreateInvoiceInput): Promise<IntegrationResult<InvoiceRef>>;
}

export interface SendSmsInput {
  phone: string;
  message: string;
}

export interface SmsAdapter {
  key: string;
  sendSms(input: SendSmsInput): Promise<IntegrationResult<{ providerKey: string }>>;
}
