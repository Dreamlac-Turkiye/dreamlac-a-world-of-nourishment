import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { drainOutbox } from "@/services/operations/worker.server";

/**
 * Outbox kuyruğunu boşaltan iç uç nokta (zamanlayıcı tarafından çağrılır).
 *
 * Doğrulama: paylaşılan anahtar "x-dreamlac-worker-token" başlığında beklenir.
 * Anahtar tanımlı değilse uç nokta kapalıdır. Kuyruk yalnızca sunucu tarafında
 * service_role ile işlenir; istek gövdesi hiçbir şeyi yönlendirmez.
 */

const WORKER_TOKEN_ENV = "OUTBOX_WORKER_TOKEN";
const MAX_BATCH = 200;

export const Route = createFileRoute("/api/internal/outbox-drain")({
  server: {
    handlers: {
      // Without this, GET falls through to the SPA and answers 200 with the
      // page shell: a scheduler pointed at the wrong verb would look healthy
      // while the queue silently never drains.
      GET: async () =>
        Response.json(
          { ok: false, error: "Bu uç nokta yalnızca POST kabul eder." },
          { status: 405, headers: { allow: "POST" } },
        ),
      POST: async ({ request }) => {
        const token = process.env[WORKER_TOKEN_ENV];
        if (!token) {
          return Response.json(
            { ok: false, error: "Outbox çalıştırıcı anahtarı tanımlı değil." },
            { status: 503 },
          );
        }

        const given = Buffer.from(request.headers.get("x-dreamlac-worker-token") ?? "");
        const want = Buffer.from(token);
        if (given.length !== want.length || !timingSafeEqual(given, want)) {
          return Response.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
        }

        const requested = Number(new URL(request.url).searchParams.get("limit") ?? "50");
        const limit = Number.isFinite(requested)
          ? Math.min(Math.max(Math.trunc(requested), 1), MAX_BATCH)
          : 50;

        try {
          return Response.json({ ok: true, ...(await drainOutbox(limit)) });
        } catch (cause) {
          // The reason is for the operator reading logs, not the caller: a claim
          // failure here means database or credential trouble, not a bad request.
          console.error("[outbox] drain failed", cause);
          return Response.json({ ok: false, error: "Kuyruk işlenemedi." }, { status: 500 });
        }
      },
    },
  },
});
