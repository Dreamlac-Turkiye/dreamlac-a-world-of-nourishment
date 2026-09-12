import { z } from "zod";
import { MARKET_CODES, type MarketCode } from "./markets/types";

const providerName = z.string().trim().min(1).default("disabled");
const runtimeSchema = z.object({
  APP_ENV: z
    .enum(["development", "test", "preview", "staging", "production"])
    .default("development"),
  VITE_SITE_URL: z.string().url(),
  VITE_DEFAULT_MARKET: z.enum(MARKET_CODES).default("TR"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  TR_PAYMENT_PROVIDER: providerName,
  TR_SHIPPING_PROVIDER: providerName,
  TR_INVOICE_PROVIDER: providerName,
  TR_EMAIL_PROVIDER: providerName,
  TR_SMS_PROVIDER: providerName,
});

export type RuntimeConfig = z.infer<typeof runtimeSchema>;
let cachedConfig: RuntimeConfig | undefined;

/** Validate once and fail closed on incomplete or unsafe server configuration. */
export function getRuntimeConfig(): RuntimeConfig {
  if (cachedConfig) return cachedConfig;
  const parsed = runtimeSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server configuration: ${fields}`);
  }
  if (parsed.data.APP_ENV === "production") {
    const providers = [
      parsed.data.TR_PAYMENT_PROVIDER,
      parsed.data.TR_SHIPPING_PROVIDER,
      parsed.data.TR_INVOICE_PROVIDER,
    ];
    if (providers.some((provider) => provider === "mock" || provider === "test")) {
      throw new Error("Production cannot start with mock or test commerce providers");
    }
  }
  cachedConfig = parsed.data;
  return cachedConfig;
}

export function getProviderName(
  config: RuntimeConfig,
  market: MarketCode,
  kind: "payment" | "shipping" | "invoice" | "email" | "sms",
): string {
  if (market !== "TR") return "disabled";
  return String(config[`TR_${kind.toUpperCase()}_PROVIDER` as keyof RuntimeConfig]);
}
