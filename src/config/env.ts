import { resolveDataConfig } from "./data-mode";

// These are browser-safe Lovable Cloud identifiers, not secrets. Environment
// values still take precedence so independent deployments can replace them.
const DEFAULT_SUPABASE_URL = "https://ixmjuuhwjjdcuidromzs.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NkQsPlCOMETEU9Og030lnw__DqD9REl";

export const dataConfig = resolveDataConfig({
  mode: import.meta.env["VITE_DATA_MODE"],
  url: import.meta.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL,
  key: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  allowDemo: import.meta.env.DEV || ["preview", "development"].includes(import.meta.env.MODE),
});
export const isDemoMode = dataConfig.mode === "demo";
export const demoMessage =
  "Önizleme modu: Bu işlem devre dışıdır; gerçek kayıt veya ödeme oluşturulmaz.";
