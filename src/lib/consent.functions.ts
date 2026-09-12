import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { consumeRateLimit } from "@/lib/operations.functions";

export const recordCookieConsent = createServerFn({ method: "POST" })
  .validator((value: unknown) =>
    z.object({ anonymousId: z.string().uuid(), choice: z.enum(["all", "necessary"]) }).parse(value),
  )
  .handler(async ({ data }) => {
    const limit = await consumeRateLimit({
      scope: "cookie-consent",
      subject: data.anonymousId,
      limit: 10,
      windowSeconds: 86400,
    });
    if (!limit.allowed) return { ok: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin.rpc("record_cookie_consent", {
      p_anonymous_id: data.anonymousId,
      p_choice: data.choice,
      p_policy_version: "cookie-v1",
    });
    if (result.error) throw new Error(`Consent record failed: ${result.error.code ?? "UNKNOWN"}`);
    return { ok: true };
  });
