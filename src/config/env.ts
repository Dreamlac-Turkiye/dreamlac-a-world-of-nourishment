import { resolveDataConfig } from "./data-mode";

export const dataConfig = resolveDataConfig({
  mode: import.meta.env["VITE_DATA_MODE"],
  url: import.meta.env["VITE_SUPABASE_URL"],
  key: import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
  allowDemo: import.meta.env.DEV || ["preview", "development"].includes(import.meta.env.MODE),
});
export const isDemoMode = dataConfig.mode === "demo";
export const demoMessage =
  "Önizleme modu: Bu işlem devre dışıdır; gerçek kayıt veya ödeme oluşturulmaz.";
