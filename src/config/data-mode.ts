export type DataMode = "demo" | "supabase";

/** Shared by Vite, browser and SSR. No server secrets belong in this input. */
export function resolveDataConfig(input: {
  mode?: string | undefined;
  url?: string | undefined;
  key?: string | undefined;
  allowDemo: boolean;
}) {
  const mode = input.mode || (input.allowDemo && !input.url && !input.key ? "demo" : "supabase");
  if (mode !== "demo" && mode !== "supabase") throw new Error("Invalid VITE_DATA_MODE");
  if (mode === "demo") {
    if (!input.allowDemo) throw new Error("Demo data is forbidden in production");
    return { mode: "demo" as const, url: "", key: "" };
  }
  if (!input.url || !input.key)
    throw new Error(
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the build environment",
    );
  const url = new URL(input.url);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Invalid Supabase URL protocol");
  if (input.key.startsWith("sb_secret_"))
    throw new Error("A server secret cannot be used as a browser key");
  // Legacy service-role JWTs must never be bundled, either.
  if (input.key.split(".").length === 3) {
    try {
      const payload = JSON.parse(
        atob(input.key.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")),
      );
      if (payload.role === "service_role")
        throw new Error("A service-role key cannot be used in the browser");
    } catch (error) {
      if (error instanceof Error && error.message.includes("service-role")) throw error;
      throw new Error("Invalid public JWT key");
    }
  }
  return { mode: "supabase" as const, url: input.url, key: input.key };
}
