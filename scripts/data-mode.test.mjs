import test from "node:test";
import assert from "node:assert/strict";
import { resolveDataConfig } from "../src/config/data-mode.ts";

test("empty local environment uses offline preview", () => {
  assert.equal(resolveDataConfig({ allowDemo: true }).mode, "demo");
});
test("production rejects missing config and explicit demo", () => {
  assert.throws(() => resolveDataConfig({ allowDemo: false }), /VITE_SUPABASE/);
  assert.throws(() => resolveDataConfig({ allowDemo: false, mode: "demo" }), /forbidden/);
});
test("partial configuration and explicit live mode never silently fall back", () => {
  assert.throws(() => resolveDataConfig({ allowDemo: true, mode: "supabase" }));
  assert.throws(() => resolveDataConfig({ allowDemo: true, url: "https://example.invalid" }));
  assert.throws(() => resolveDataConfig({ allowDemo: true, mode: "typo" }));
});
test("explicit demo discards any supplied production connection", () => {
  assert.deepEqual(
    resolveDataConfig({
      allowDemo: true,
      mode: "demo",
      url: "https://example.invalid",
      key: "not-a-real-key",
    }),
    { mode: "demo", url: "", key: "" },
  );
});
test("live mode validates URL and rejects server keys", () => {
  const input = {
    allowDemo: false,
    mode: "supabase",
    url: "https://example.invalid",
    key: "test-public-placeholder",
  };
  assert.equal(resolveDataConfig(input).mode, "supabase");
  assert.throws(() => resolveDataConfig({ ...input, url: "javascript:alert(1)" }));
  assert.throws(() => resolveDataConfig({ ...input, key: "sb_secret_test-placeholder" }));
  const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
  assert.throws(() => resolveDataConfig({ ...input, key: `test.${payload}.test` }), /service-role/);
});
