import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/operations.functions";

export const requestNewsletterSubscription = createServerFn({ method: "POST" })
  .validator((value: unknown) =>
    z
      .object({ email: z.string().trim().email().max(254), marketingConsent: z.literal(true) })
      .parse(value),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLocaleLowerCase("en-US");
    const limit = await consumeRateLimit({
      scope: "newsletter",
      subject: email,
      limit: 3,
      windowSeconds: 3600,
    });
    if (!limit.allowed) throw new Error("RATE_LIMITED");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("request_marketing_subscription", {
      p_market_code: "TR",
      p_email: email,
      p_consent_version: "commercial-consent-v1",
    });
    if (result.error)
      throw new Error(`Newsletter request failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });
