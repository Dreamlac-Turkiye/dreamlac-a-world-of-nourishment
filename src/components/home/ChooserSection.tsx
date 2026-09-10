import { Link } from "@tanstack/react-router";
import { ArrowRight, Stethoscope } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { mockProducts } from "@/data/mock/products";
import { cn } from "@/lib/utils";
import type { StageKey } from "@/types";

const stageTone: Record<StageKey, string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
};

/**
 * Karşılaştırma alanı — tıbbi bir öneri aracı DEĞİLDİR.
 * Yalnızca ürün alanlarını yan yana gösterir.
 */
export function ChooserSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow={tr.chooser.eyebrow}
        title={tr.chooser.title}
        description={tr.chooser.description}
      />

      <div className="mt-10 overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-soft)]">
        <div className="grid gap-px bg-border/60 md:grid-cols-3">
          {mockProducts.map((product) => (
            <div key={product.id} className="bg-card p-6">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn("droplet size-9 shrink-0", stageTone[product.stage])}
                />
                <h3 className="min-w-0 truncate text-lg font-semibold text-primary-deep">{product.name}</h3>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{tr.chooser.columnLabels.age}</dt>
                  <dd className="mt-0.5 text-primary-deep/85">
                    {product.ageRange ?? tr.products.placeholders.age}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{tr.chooser.columnLabels.weight}</dt>
                  <dd className="mt-0.5 text-primary-deep/85">
                    {product.weight ?? tr.products.placeholders.weight}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{tr.chooser.columnLabels.pack}</dt>
                  <dd className="mt-0.5 text-primary-deep/85">{product.packagingNote}</dd>
                </div>
              </dl>
              <Button asChild variant="ghost" className="mt-5 rounded-full px-3">
                <Link to="/urunler/$slug" params={{ slug: product.slug }}>
                  {tr.products.detailsCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div
        role="note"
        className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-champagne/70 bg-champagne/25 p-5"
      >
        <Icon3D icon={Stethoscope} size="sm" tone="champagne" />
        <p className="text-sm leading-relaxed text-champagne-foreground">{tr.chooser.disclaimer}</p>
      </div>
    </section>
  );
}
