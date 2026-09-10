import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";

const title = "Hesabım — Dreamlac";
const description = "Dreamlac hesap ekranları hazırlanıyor. Yönetim paneline giriş yapabilirsiniz.";

export const Route = createFileRoute("/hesabim")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-primary-deep">{tr.nav.account}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Müşteri hesap ekranları sonraki aşamada tasarlanacaktır. Ürün bilgilerini yönetmek için
        yönetim paneline giriş yapabilirsiniz.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link to="/giris">{tr.auth.signIn}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/yonetim">{tr.admin.navLabel}</Link>
        </Button>
      </div>
    </main>
  );
}
