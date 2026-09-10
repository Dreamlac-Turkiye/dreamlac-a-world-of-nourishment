import { Factory, MapPin } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { tr } from "@/content/tr";
import { company } from "@/data/company";

/**
 * Üretim tesisi bölümü.
 * NOT: Gerçek tesis fotoğrafı iletilmediği için görsel alan soyut 3D formlarla
 * doldurulmuştur — YER TUTUCU. Rastgele fabrika stok fotoğrafı kullanılmaz.
 */
export function FactorySection() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="min-w-0">
            <SectionHeading
              eyebrow={tr.factory.eyebrow}
              title={tr.factory.title}
              description={tr.factory.description}
            />
            <ul className="mt-7 space-y-4">
              <li className="flex items-start gap-3">
                <Icon3D icon={Factory} size="sm" tone="primary" />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-primary-deep">{company.legalName}</p>
                  <p className="mt-1 text-muted-foreground">{tr.brand.tagline}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Icon3D icon={MapPin} size="sm" tone="stage-2" />
                <p className="min-w-0 text-sm leading-relaxed text-muted-foreground">
                  {company.address}
                </p>
              </li>
            </ul>
          </div>

          <div className="surface-glass relative min-w-0 overflow-hidden rounded-[2.5rem] p-6 shadow-[var(--shadow-deep)]">
            <div
              aria-hidden="true"
              className="relative grid h-56 place-items-center overflow-hidden rounded-[1.75rem] border border-border/50 bg-[image:var(--gradient-milk)] sm:h-72"
            >
              <span className="droplet animate-float-slow size-28 bg-primary-soft" />
              <span className="droplet absolute bottom-6 left-8 size-16 bg-champagne/70" />
              <span className="droplet absolute right-10 top-8 size-12 bg-stage-2" />
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              {tr.factory.visualNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
