import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CARGO_WEBHOOK_SECRET_ENV,
  getProvider,
  integrationProviders,
  type IntegrationCategory,
} from "@/data/integrations";

/**
 * Entegrasyon durum servisleri.
 *
 * Yalnızca yönetici rolü çağırabilir. Gizli anahtar DEĞERLERİ hiçbir zaman
 * döndürülmez; yalnızca "tanımlı / eksik" bilgisi ve eksik anahtarın adı döner.
 */

export interface IntegrationStatus {
  providerKey: string;
  category: IntegrationCategory;
  displayName: string;
  purpose: string;
  docsUrl: string | null;
  ready: boolean;
  missingSecrets: string[];
  requiredSecrets: { env: string; label: string; required: boolean; present: boolean }[];
}

async function assertAdmin(context: { supabase: unknown; userId: string }): Promise<void> {
  const supabase = context.supabase as {
    rpc: (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: unknown }>;
  };
  const { data } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Forbidden");
}

/** Tüm sağlayıcıların anahtar hazırlık durumu (yalnızca yönetici). */
export const listIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IntegrationStatus[]> => {
    await assertAdmin(context);
    const { checkSecrets } = await import("@/services/integrations/adapters.server");

    return integrationProviders.map((provider) => {
      const readiness = checkSecrets(provider);
      return {
        providerKey: provider.key,
        category: provider.category,
        displayName: provider.displayName,
        purpose: provider.purpose,
        docsUrl: provider.docsUrl,
        ready: readiness.ready,
        missingSecrets: readiness.missing,
        requiredSecrets: provider.secrets.map((secret) => ({
          env: secret.env,
          label: secret.label,
          required: secret.required,
          present: readiness.present.includes(secret.env),
        })),
      };
    });
  });

/** Kargo bildirim adresi için doğrulama anahtarının tanımlı olup olmadığı. */
export const getWebhookReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ secretName: string; ready: boolean }> => {
    await assertAdmin(context);
    const value = process.env[CARGO_WEBHOOK_SECRET_ENV];
    return { secretName: CARGO_WEBHOOK_SECRET_ENV, ready: Boolean(value && value.trim() !== "") };
  });

/**
 * Bir sağlayıcıyı bağlantı denemesiyle sınar. Anahtar yoksa "hazır değil" mesajı döner;
 * gerçek servis çağrısı ilgili adaptör doldurulduğunda devreye girer.
 */
export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ providerKey: z.string().min(1) }).parse(data))
  .handler(
    async ({ data, context }): Promise<{ ok: boolean; message: string; notConfigured: boolean }> => {
      await assertAdmin(context);

      const provider = getProvider(data.providerKey);
      if (!provider) return { ok: false, message: "Tanımsız sağlayıcı.", notConfigured: true };

      const adapters = await import("@/services/integrations/adapters.server");

      const result =
        provider.category === "cargo"
          ? await adapters.getCargoAdapter(provider.key).trackShipment("TEST")
          : provider.category === "payment"
            ? await adapters.getPaymentAdapter(provider.key).verifyPayment("TEST")
            : provider.category === "invoice"
              ? await adapters
                  .getInvoiceAdapter(provider.key)
                  .createInvoice({
                    orderNumber: "TEST",
                    customerName: "Test",
                    customerEmail: "test@example.com",
                    lines: [],
                  })
              : await adapters
                  .getSmsAdapter(provider.key)
                  .sendSms({ phone: "0000000000", message: "Test" });

      return {
        ok: result.ok,
        message: result.error ?? "Bağlantı denemesi tamamlandı.",
        notConfigured: Boolean(result.notConfigured),
      };
    },
  );
