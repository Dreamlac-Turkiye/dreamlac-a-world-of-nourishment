import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import { resolveDataConfig } from "./src/config/data-mode";

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const config = resolveDataConfig({
    // Design previews must not accidentally attach to a live project injected
    // by an editor. Live development requires an explicit VITE_DATA_MODE.
    mode:
      env["VITE_DATA_MODE"] ||
      (command === "serve" && env["APP_ENV"] !== "production" ? "demo" : undefined),
    url: env["VITE_SUPABASE_URL"],
    key: env["VITE_SUPABASE_PUBLISHABLE_KEY"],
    allowDemo:
      env["APP_ENV"] !== "production" &&
      (command === "serve" || mode === "preview" || mode === "development"),
  });
  return {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart(),
      react(),
      ...(command === "build"
        ? nitro({
            preset: env["NITRO_PRESET"] || "node-server",
            compatibilityDate: "2026-09-18",
            // Hosting serves dist/; writing elsewhere leaves a stale old build live.
            output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/public" },
            cloudflare: {
              deployConfig: true,
              nodeCompat: true,
              wrangler: { name: "dreamlac-turkey", keep_vars: true },
            },
          })
        : []),
    ],
    define: { "import.meta.env.VITE_DATA_MODE": JSON.stringify(config.mode) },
    resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router"] },
    server: { host: "0.0.0.0", port: Number(env["PORT"] || 8080) },
  };
});
