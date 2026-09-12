const baseUrl = process.env.STAGING_BASE_URL;
if (!baseUrl || process.env.ALLOW_STAGING_TEST !== "true") {
  throw new Error("Staging test requires STAGING_BASE_URL and ALLOW_STAGING_TEST=true");
}
const target = new URL(baseUrl);
const blocked = new Set(["dreamlac.com.tr", "www.dreamlac.com.tr"]);
if (blocked.has(target.hostname) || target.protocol !== "https:") {
  throw new Error("Refusing to test a production or non-HTTPS target");
}
const total = Number(process.env.SMOKE_REQUESTS ?? 100);
const concurrency = Number(process.env.SMOKE_CONCURRENCY ?? 10);
if (!Number.isInteger(total) || total < 1 || total > 2000) throw new Error("Invalid request count");
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50)
  throw new Error("Invalid concurrency");
const latencies = [];
let failures = 0;
let cursor = 0;
async function worker() {
  while (cursor < total) {
    cursor += 1;
    const started = performance.now();
    try {
      const response = await fetch(target, {
        headers: { "user-agent": "dreamlac-staging-smoke/1.0" },
        redirect: "follow",
      });
      if (!response.ok || !response.headers.get("x-request-id")) failures += 1;
      await response.arrayBuffer();
    } catch {
      failures += 1;
    }
    latencies.push(performance.now() - started);
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));
latencies.sort((a, b) => a - b);
const percentile = (value) =>
  latencies[Math.min(latencies.length - 1, Math.ceil(value * latencies.length) - 1)];
const summary = {
  target: target.origin,
  requests: total,
  failures,
  p50Ms: Math.round(percentile(0.5)),
  p95Ms: Math.round(percentile(0.95)),
};
console.log(JSON.stringify(summary, null, 2));
if (failures > 0 || summary.p95Ms > 3000) process.exitCode = 1;
