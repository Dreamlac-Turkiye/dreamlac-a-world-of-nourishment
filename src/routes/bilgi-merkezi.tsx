import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { BookOpen, PackageCheck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/bilgi-merkezi")({
  head: () => ({
    meta: [
      { title: "Bilgi Merkezi — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac ürün dönemleri, hazırlama ve güvenlik bilgilerine ulaşın.",
      },
      { property: "og:title", content: "Bilgi Merkezi — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac ürün dönemleri, hazırlama ve güvenlik bilgilerine ulaşın.",
      },
    ],
  }),
  component: () => (
    <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Bilgi merkezi
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-primary-deep sm:text-4xl">
        Güvenilir bilgiye kısa yoldan ulaşın
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Bu alan tanı veya kişisel beslenme önerisi sunmaz. Kullanımda ambalaj talimatı ve sağlık
        profesyonelinizin yönlendirmesi esastır.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoLink
          to="/urunler"
          icon={<PackageCheck />}
          title="Ürün dönemleri"
          text="Dreamlac 1, 2 ve 3 yaş dönemlerini karşılaştırın."
        />
        <InfoLink
          to="/kalite-ve-guvenlik"
          icon={<ShieldCheck />}
          title="Kalite yaklaşımı"
          text="Üretim ve izlenebilirlik adımlarını inceleyin."
        />
        <InfoLink
          to="/sikca-sorulan-sorular"
          icon={<BookOpen />}
          title="Sık sorulanlar"
          text="Hazırlama, saklama ve içerik yanıtlarını görün."
        />
      </div>
    </main>
  ),
});

function InfoLink({
  to,
  icon,
  title,
  text,
}: {
  to: "/urunler" | "/kalite-ve-guvenlik" | "/sikca-sorulan-sorular";
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
    >
      <div className="text-primary">{icon}</div>
      <h2 className="mt-4 font-semibold text-primary-deep">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}
