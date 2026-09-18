import { Factory, MapPin } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { tr } from "@/content/tr";
import { company } from "@/data/company";

/** Üretim tesisi bölümü — yalnızca metin bilgisi, tesis fotoğrafı kullanılmaz. */
export function FactorySection() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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

          <div
            aria-hidden="true"
            className="surface-glass grain relative min-h-[16rem] overflow-hidden rounded-[2rem] p-8 shadow-[var(--shadow-deep)] lg:min-h-[22rem]"
          >
            <div className="animate-float-slow droplet absolute -top-14 -right-10 size-56 bg-[image:var(--gradient-milk)] opacity-70" />
            <div className="droplet absolute -bottom-16 -left-12 size-48 bg-primary-soft/60" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="droplet grid size-14 place-items-center bg-primary-deep text-primary-foreground shadow-[var(--shadow-lifted)]">
                <MapPin size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-primary uppercase">
                  {tr.factory.eyebrow}
                </p>
                <p className="mt-2 text-3xl font-semibold text-primary-deep sm:text-4xl">
                  {company.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
