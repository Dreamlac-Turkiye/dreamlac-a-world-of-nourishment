import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/data/company";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — Dreamlac" },
      {
        name: "description",
        content: "Dreamlac Türkiye iletişim bilgileri ve üretim tesisi adresi.",
      },
      { property: "og:title", content: "İletişim — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac Türkiye iletişim bilgileri ve üretim tesisi adresi.",
      },
    ],
  }),
  component: () => (
    <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Size yardımcı olalım
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-primary-deep sm:text-4xl">İletişim</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Ürün, sipariş ve kurumsal konulardaki sorularınız için aşağıdaki kanallardan bize
        ulaşabilirsiniz.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ContactCard icon={<Mail />} title="E-posta">
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </ContactCard>
        <ContactCard icon={<Phone />} title="Telefon">
          <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a>
          <br />
          <a href={`tel:${company.mobile.replace(/\s/g, "")}`}>{company.mobile}</a>
        </ContactCard>
        <ContactCard icon={<MapPin />} title="Adres">
          <address className="not-italic">{company.address}</address>
        </ContactCard>
      </div>
      <p className="mt-8 rounded-2xl bg-champagne/25 p-4 text-xs leading-relaxed text-champagne-foreground/90">
        Acil sağlık soruları için internet sitesi yerine doğrudan sağlık profesyonelinize
        başvurunuz.
      </p>
    </main>
  ),
});

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="text-primary" aria-hidden="true">
        {icon}
      </div>
      <h2 className="mt-4 font-semibold text-primary-deep">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
