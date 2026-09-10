import { Link } from "@tanstack/react-router";
import { ArrowLeft, Hammer } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";

/**
 * Sonraki aşamalarda tasarlanacak sayfalar için geçici iskele.
 * Menü ve footer bağlantılarının çalışır kalmasını sağlar.
 */
export function PagePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <main className="bg-hero-aura mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Icon3D icon={Hammer} size="lg" tone="champagne" />
      <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">{title}</h1>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description ?? "Bu sayfanın tasarımı sonraki aşamada hazırlanacaktır."}
      </p>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/">
          <ArrowLeft aria-hidden="true" />
          {tr.nav.home}
        </Link>
      </Button>
    </main>
  );
}
