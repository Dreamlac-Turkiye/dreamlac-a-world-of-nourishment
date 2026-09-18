import { spawn } from "node:child_process";
import assert from "node:assert/strict";

// Run after build:preview. The child has no Supabase configuration.
const env = { ...process.env, PORT: "8093", HOST: "127.0.0.1" };
for (const key of Object.keys(env)) if (key.includes("SUPABASE")) delete env[key];
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.on("data", (chunk) => {
  logs += chunk;
});
server.stderr.on("data", (chunk) => {
  logs += chunk;
});
const origin = "http://127.0.0.1:8093";
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      await fetch(origin);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  assert.ok(ready, `Preview did not start: ${logs}`);
  for (const path of [
    "/",
    "/urunler",
    "/urunler/dreamlac-1",
    "/urunler/dreamlac-2",
    "/urunler/dreamlac-3",
    "/sepet",
    "/odeme",
    "/giris",
    "/yonetim-onizleme",
    "/kvkk",
    "/cerez-politikasi",
    "/gizlilik-politikasi",
    "/teslimat-politikasi",
    "/iade-ve-iptal-politikasi",
    "/mesafeli-satis-sozlesmesi",
    "/on-bilgilendirme-formu",
    "/uyelik-sozlesmesi",
    "/ticari-elektronik-ileti-onayi",
    "/iletisim",
    "/siparis-takip",
    "/arama",
    "/hakkimizda",
    "/kalite-ve-guvenlik",
    "/bilgi-merkezi",
    "/sikca-sorulan-sorular",
  ]) {
    const response = await fetch(origin + path);
    const html = await response.text();
    assert.equal(response.status, 200, `${path}: ${logs}`);
    assert.ok(html.includes("Önizleme modu"), `${path}: missing preview notice`);
    assert.ok(!html.includes("Sayfa yüklenemedi"), `${path}: rendered error boundary`);
    console.log(`PASS ${path}`);
  }
} finally {
  server.kill("SIGTERM");
}
