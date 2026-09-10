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
        <div className="grid gap-10">
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
        </div>
      </div>
    </section>
  );
}
