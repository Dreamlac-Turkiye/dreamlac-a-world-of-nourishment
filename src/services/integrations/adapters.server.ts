/**
 * Sunucu tarafı adaptör fabrikası (yalnızca sunucuda çalışır).
 *
 * Her sağlayıcı için tek bir adaptör vardır. Anahtarlar güvenli depoda tanımlı
 * değilse adaptör istek göndermez; "notConfigured" sonucu döner. Böylece akışlar
 * bugün uçtan uca çalışır, anahtar eklendiğinde ilgili gövde doldurulur.
 */

import { getProvider, type IntegrationProvider } from "@/data/integrations";
import type {
  CargoAdapter,
  IntegrationResult,
  InvoiceAdapter,
  PaymentAdapter,
  SmsAdapter,
} from "./types";

export interface SecretReadiness {
  providerKey: string;
  /** Zorunlu anahtarların tümü tanımlı mı? */
  ready: boolean;
  /** Eksik olan ortam değişkeni adları (değerler asla dönmez). */
  missing: string[];
  /** Tanımlı olan ortam değişkeni adları (değerler asla dönmez). */
  present: string[];
}

/** Bir sağlayıcının anahtarlarının hazır olup olmadığını bildirir; değer döndürmez. */
export function checkSecrets(provider: IntegrationProvider): SecretReadiness {
  const missing: string[] = [];
  const present: string[] = [];

  for (const secret of provider.secrets) {
    const value = process.env[secret.env];
    if (value && value.trim() !== "") {
      present.push(secret.env);
    } else if (secret.required) {
      missing.push(secret.env);
    }
  }

  return { providerKey: provider.key, ready: missing.length === 0, missing, present };
}

function notConfigured<T>(provider: IntegrationProvider, missing: string[]): IntegrationResult<T> {
  return {
    ok: false,
    data: null,
    notConfigured: true,
    error: `${provider.displayName} entegrasyonu henüz tamamlanmadı. Eksik ayar: ${missing.join(", ")}`,
  };
}

/** Anahtarlar tamamlanana kadar kullanılan ortak "hazır değil" adaptörü. */
function pendingResult<T>(providerKey: string): IntegrationResult<T> {
  const provider = getProvider(providerKey);
  if (!provider) {
    return {
      ok: false,
      data: null,
      error: "Tanımsız entegrasyon sağlayıcısı.",
      notConfigured: true,
    };
  }
  const readiness = checkSecrets(provider);
  if (!readiness.ready) return notConfigured<T>(provider, readiness.missing);

  return {
    ok: false,
    data: null,
    notConfigured: true,
    error: `${provider.displayName} anahtarları tanımlı. Servis çağrısı bir sonraki adımda etkinleştirilecek.`,
  };
}

export function getCargoAdapter(providerKey: string): CargoAdapter {
  return {
    key: providerKey,
    createShipment: async () => pendingResult(providerKey),
    trackShipment: async () => pendingResult(providerKey),
  };
}

export function getPaymentAdapter(providerKey: string): PaymentAdapter {
  return {
    key: providerKey,
    startPayment: async () => pendingResult(providerKey),
    verifyPayment: async () => pendingResult(providerKey),
  };
}

export function getInvoiceAdapter(providerKey: string): InvoiceAdapter {
  return {
    key: providerKey,
    createInvoice: async () => pendingResult(providerKey),
  };
}

export function getSmsAdapter(providerKey: string): SmsAdapter {
  return {
    key: providerKey,
    sendSms: async () => pendingResult(providerKey),
  };
}
