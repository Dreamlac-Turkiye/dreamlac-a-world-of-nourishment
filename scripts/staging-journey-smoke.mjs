const baseUrl = process.env.STAGING_BASE_URL;
if (!baseUrl || process.env.ALLOW_STAGING_TEST !== "true") {
  throw new Error("Journey smoke requires STAGING_BASE_URL and ALLOW_STAGING_TEST=true");
}
const origin = new URL(baseUrl);
const blocked = new Set(["dreamlac.com.tr", "www.dreamlac.com.tr"]);
if (origin.protocol !== "https:" || blocked.has(origin.hostname)) {
  throw new Error("Refusing to test a production or non-HTTPS target");
}
const routes = [
  "/",
  "/urunler",
  "/urunler/dreamlac-1",
  "/urunler/dreamlac-2",
  "/urunler/dreamlac-3",
  "/arama",
  "/bilgi-merkezi",
  "/iletisim",
  "/sepet",
  "/giris",
  "/siparis-takip",
];
const results = [];
for (const route of routes) {
  const started = performance.now();
  const url = new URL(route, origin);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "dreamlac-staging-journey/1.0" },
      redirect: "manual",
    });
    const requestId = response.headers.get("x-request-id");
    const location = response.headers.get("location");
    const acceptableRedirect = response.status >= 300 && response.status < 400 && Boolean(location);
    const ok = (response.ok || acceptableRedirect) && Boolean(requestId);
    await response.arrayBuffer();
    results.push({
      route,
      status: response.status,
      ok,
      requestId,
      redirectedTo: location,
      latencyMs: Math.round(performance.now() - started),
    });
  } catch (error) {
    results.push({
      route,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      latencyMs: Math.round(performance.now() - started),
    });
  }
}
const failures = results.filter((result) => !result.ok);
console.log(JSON.stringify({ target: origin.origin, routes: results.length, failures: failures.length, results }, null, 2));
if (failures.length) process.exitCode = 1;
