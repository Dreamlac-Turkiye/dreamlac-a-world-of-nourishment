import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgePercent,
  Boxes,
  Headphones,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { AdminWorkspaceNav } from "@/components/admin/AdminWorkspaceNav";
import { AdminReportsSection } from "@/components/admin/AdminReportsSection";
import { LaunchReadinessSection } from "@/components/admin/LaunchReadinessSection";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/yonetim-onizleme")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli Önizleme — Dreamlac" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPreviewPage,
});

const previewPermissions = [
  "operations.read",
  "orders.read",
  "inventory.manage",
  "users.manage",
  "support.manage",
  "customers.read",
  "reports.read",
  "catalog.manage",
  "content.manage",
  "promotions.manage",
  "legal.manage",
  "integrations.manage",
];

const metrics = [
  { label: "Bugünkü sipariş", value: "128", note: "%12,4 artış", icon: ShoppingBag },
  { label: "Net satış", value: "₺186.420", note: "Bugün", icon: TrendingUp },
  { label: "Hazırlanacak", value: "34", note: "6 öncelikli", icon: PackageCheck },
  { label: "Aktif müşteri", value: "4.892", note: "Türkiye", icon: Users },
];

const orders = [
  ["DL-TR-2026-001284", "Elif Yılmaz", "₺1.149,70", "Hazırlanıyor"],
  ["DL-TR-2026-001283", "Merve Kaya", "₺749,80", "Ödeme alındı"],
  ["DL-TR-2026-001282", "Ayşe Demir", "₺1.499,60", "Kargoya hazır"],
  ["DL-TR-2026-001281", "Zeynep Şahin", "₺399,90", "İnceleniyor"],
];

function AdminPreviewPage() {
  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Önizleme modu:</strong> Bu sayfadaki veriler tasarım kontrolü için örnektir; gerçek
        müşteri veya sipariş bilgisi içermez.
      </div>

      <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Dreamlac Commerce OS
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">
            Yönetim merkezi
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Sipariş, stok, müşteri, destek ve kampanyaların birleşik operasyon görünümü.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/giris">Güvenli giriş</Link>
        </Button>
      </div>

      <AdminWorkspaceNav permissions={previewPermissions} />
      <LaunchReadinessSection preview />
      <section
        id="sistem"
        className="mt-5 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
      >
        <h2 className="text-xl font-semibold text-primary-deep">Sistem sağlığı ve olaylar</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Tüm kritik servisler çalışıyor · Açık kritik olay yok
        </p>
      </section>

      <section id="genel-bakis" className="mt-8 scroll-mt-24">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <article
              key={label}
              className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon size={18} className="text-primary" />
              </div>
              <strong className="mt-4 block text-2xl text-primary-deep">{value}</strong>
              <span className="mt-1 block text-xs text-emerald-700">{note}</span>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section
          id="operasyonlar"
          className="scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary-deep">Son siparişler</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Operasyon ekibinin güncel çalışma sırası
              </p>
            </div>
            <ShoppingBag className="text-primary" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-border/70 text-xs text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Sipariş</th>
                  <th className="pb-3 font-medium">Müşteri</th>
                  <th className="pb-3 font-medium">Tutar</th>
                  <th className="pb-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order[0]} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-primary-deep">{order[0]}</td>
                    <td className="py-3">{order[1]}</td>
                    <td className="py-3">{order[2]}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary-deep">
                        {order[3]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={19} className="text-amber-600" />
            <h2 className="text-xl font-semibold text-primary-deep">Dikkat gerekenler</h2>
          </div>
          <div className="mt-4 space-y-3">
            <AlertRow icon={Boxes} title="Dreamlac 1 stoğu azalıyor" text="Satılabilir 42 kutu" />
            <AlertRow
              icon={Headphones}
              title="5 destek talebi bekliyor"
              text="En eski talep 38 dakika"
            />
            <AlertRow
              icon={BadgePercent}
              title="EYLÜL10 kampanyası"
              text="Kullanım limitinin %82'si"
            />
          </div>
        </section>
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <MiniPanel id="stok" icon={Boxes} title="Stok" value="1.264" text="Toplam fiziksel ürün" />
        <MiniPanel
          id="musteriler"
          icon={UserRound}
          title="Müşteriler"
          value="92"
          text="Bu ay yeni müşteri"
        />
        <MiniPanel
          id="destek"
          icon={Headphones}
          title="Destek"
          value="4 dk"
          text="Ortalama ilk yanıt"
        />
      </section>
      <AdminReportsSection preview />
      <section
        id="icerik"
        className="mt-5 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
      >
        <h2 className="text-xl font-semibold text-primary-deep">İçerik ve SEO</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Taslak → inceleme → yayın akışı; SEO başlığı, meta açıklama ve içerik sürümleri.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniPanel id="taslak" icon={PackageCheck} title="Taslak" value="6" text="Düzenleniyor" />
          <MiniPanel
            id="inceleme"
            icon={AlertTriangle}
            title="İncelemede"
            value="2"
            text="Onay bekliyor"
          />
          <MiniPanel
            id="yayinda"
            icon={TrendingUp}
            title="Yayında"
            value="18"
            text="Türkiye içeriği"
          />
        </div>
      </section>
    </main>
  );
}

function AlertRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Boxes;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-secondary/60 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-primary">
        <Icon size={16} />
      </span>
      <div>
        <strong className="block text-sm text-primary-deep">{title}</strong>
        <span className="text-xs text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

function MiniPanel({
  id,
  icon: Icon,
  title,
  value,
  text,
}: {
  id: string;
  icon: typeof Boxes;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <article id={id} className="scroll-mt-24 rounded-[1.5rem] border border-border/70 bg-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-primary-deep">
        <Icon size={17} className="text-primary" />
        {title}
      </div>
      <strong className="mt-4 block text-2xl text-primary-deep">{value}</strong>
      <span className="text-xs text-muted-foreground">{text}</span>
    </article>
  );
}
