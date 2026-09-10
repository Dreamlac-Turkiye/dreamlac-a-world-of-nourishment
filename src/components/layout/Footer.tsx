import { Link } from "@tanstack/react-router";
import { LogoPlaceholder } from "@/components/brand/LogoPlaceholder";
import { tr } from "@/content/tr";

const columns = [
  {
    title: tr.footer.columns.brand,
    links: [
      { to: "/hakkimizda", label: tr.footer.links.about },
      { to: "/kalite-ve-guvenlik", label: tr.footer.links.quality },
      { to: "/bilgi-merkezi", label: tr.footer.links.knowledge },
      { to: "/sikca-sorulan-sorular", label: tr.footer.links.faq },
      { to: "/iletisim", label: tr.footer.links.contact },
    ],
  },
  {
    title: tr.footer.columns.shop,
    links: [
      { to: "/urunler", label: tr.footer.links.products },
      { to: "/sepet", label: tr.nav.cart },
      { to: "/hesabim", label: tr.footer.links.account },
      { to: "/siparis-takip", label: tr.footer.links.orderTracking },
      { to: "/arama", label: tr.nav.search },
    ],
  },
  {
    title: tr.footer.columns.support,
    links: [
      { to: "/teslimat-politikasi", label: tr.footer.links.shipping },
      { to: "/iade-ve-iptal-politikasi", label: tr.footer.links.returns },
      { to: "/on-bilgilendirme-formu", label: tr.footer.links.preInfo },
      { to: "/mesafeli-satis-sozlesmesi", label: tr.footer.links.distanceSales },
      { to: "/uyelik-sozlesmesi", label: tr.footer.links.membership },
    ],
  },
  {
    title: tr.footer.columns.legal,
    links: [
      { to: "/kvkk", label: tr.footer.links.kvkk },
      { to: "/gizlilik-politikasi", label: tr.footer.links.privacy },
      { to: "/cerez-politikasi", label: tr.footer.links.cookies },
      { to: "/ticari-elektronik-ileti-onayi", label: tr.footer.links.commercialMessages },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2.4fr]">
          <div className="min-w-0 space-y-5">
            <LogoPlaceholder showNote />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tr.footer.about}
            </p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="font-semibold text-primary-deep">{tr.footer.company.title}</p>
              <p>{tr.footer.company.name}</p>
              <p>{tr.footer.company.address}</p>
              <p>{tr.footer.company.phone}</p>
              <p>{tr.footer.company.email}</p>
              <p>{tr.footer.company.taxId}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-primary-deep">{tr.footer.social.title}</p>
              <p>{tr.footer.social.note}</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title} className="min-w-0">
                <h3 className="text-sm font-semibold text-primary-deep">{column.title}</h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary-deep hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {tr.brand.name}. {tr.footer.rights}
          </p>
          <Link to="/cerez-politikasi" className="underline-offset-4 hover:underline">
            {tr.footer.links.cookieSettings}
          </Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
          {tr.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
