import {
  Boxes,
  FileCheck2,
  Gauge,
  Headphones,
  PlugZap,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const sections = [
  { href: "#genel-bakis", label: "Genel bakış", icon: Gauge, permission: "operations.read" },
  { href: "#operasyonlar", label: "Operasyonlar", icon: ShoppingBag, permission: "orders.read" },
  { href: "#stok", label: "Stok", icon: Boxes, permission: "inventory.manage" },
  { href: "#kullanicilar", label: "Kullanıcılar", icon: Users, permission: "users.manage" },
  { href: "#destek", label: "Müşteri desteği", icon: Headphones, permission: "support.manage" },
  { href: "#urunler", label: "Ürünler", icon: SlidersHorizontal, permission: "catalog.manage" },
  { href: "#hukuk", label: "Hukuk", icon: FileCheck2, permission: "legal.manage" },
  {
    href: "#entegrasyonlar",
    label: "Entegrasyonlar",
    icon: PlugZap,
    permission: "integrations.manage",
  },
] as const;

export function AdminWorkspaceNav({ permissions }: { permissions: string[] }) {
  const visibleSections = sections.filter((section) => permissions.includes(section.permission));
  return (
    <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary-deep text-white shadow-[var(--shadow-lifted)]">
      <div className="grid gap-5 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            <Gauge size={15} /> Dreamlac Operasyonları
          </span>
          <h2 className="mt-3 text-2xl font-semibold">Türkiye operasyon merkezi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            Sipariş, stok, müşteri, içerik ve entegrasyonları tek çalışma alanından yönetin.
          </p>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
          TR · Europe/Istanbul
        </span>
      </div>
      <nav aria-label="Yönetim bölümleri" className="border-t border-white/10 px-3 py-3">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {visibleSections.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                className="flex min-h-10 whitespace-nowrap items-center gap-2 rounded-full px-3.5 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon size={15} /> {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
