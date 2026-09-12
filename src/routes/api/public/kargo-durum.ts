import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { CARGO_WEBHOOK_SECRET_ENV, getProvider } from "@/data/integrations";

/**
 * Kargo firmalarının durum bildirimi (webhook) adresi.
 *
 * Doğrulama: gövdenin HMAC-SHA256 imzası "x-dreamlac-signature" başlığında beklenir.
 * İmza doğrulanmadan hiçbir kayıt yazılmaz. Anahtar tanımlı değilse uç nokta kapalıdır.
 */

interface CargoWebhookPayload {
  orderNumber?: string;
  providerKey?: string;
  trackingNumber?: string;
  status?: string;
  statusDetail?: string;
  occurredAt?: string;
}

export const Route = createFileRoute("/api/public/kargo-durum")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env[CARGO_WEBHOOK_SECRET_ENV];
        if (!secret) {
          return Response.json(
            { ok: false, error: "Kargo bildirim anahtarı tanımlı değil." },
            { status: 503 },
          );
        }

        const body = await request.text();
        const signature = request.headers.get("x-dreamlac-signature") ?? "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const given = Buffer.from(signature);
        const want = Buffer.from(expected);
        if (given.length !== want.length || !timingSafeEqual(given, want)) {
          return Response.json({ ok: false, error: "İmza doğrulanamadı." }, { status: 401 });
        }

        let payload: CargoWebhookPayload;
        try {
          payload = JSON.parse(body) as CargoWebhookPayload;
        } catch {
          return Response.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
        }

        const orderNumber = payload.orderNumber?.trim();
        const providerKey = payload.providerKey?.trim();
        const status = payload.status?.trim();

        if (!orderNumber || !providerKey || !status) {
          return Response.json(
            { ok: false, error: "orderNumber, providerKey ve status zorunludur." },
            { status: 400 },
          );
        }
        if (!getProvider(providerKey)) {
          return Response.json({ ok: false, error: "Tanımsız sağlayıcı." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("shipment_events").insert({
          order_number: orderNumber,
          provider_key: providerKey,
          tracking_number: payload.trackingNumber?.trim() ?? null,
          status,
          status_detail: payload.statusDetail?.trim() ?? null,
          occurred_at: payload.occurredAt ?? new Date().toISOString(),
          payload: JSON.parse(body),
        });

        if (error) {
          return Response.json({ ok: false, error: "Kayıt oluşturulamadı." }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
