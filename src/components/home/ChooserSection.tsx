import { Link } from "@tanstack/react-router";
import { ArrowRight, Stethoscope } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { mockProducts } from "@/data/mock/products";
import { getComparisonRows } from "@/services/catalog";
import { cn } from "@/lib/utils";
import type { StageKey } from "@/types";

const stageTone: Record<StageKey, string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
};

/**
 * Karşılaştırma tablosu — tıbbi öneri veya teşhis aracı DEĞİLDİR.
 * Yalnızca katalogda verilen genel ürün bilgilerini yan yana gösterir.
 */
export function ChooserSection() {
  const rows = getComparisonRows();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow={tr.chooser.eyebrow}
        title={tr.chooser.title}
        description={tr.chooser.description}
      />

      {/* Geniş ekran: tablo */}
      <div className="mt-10 hidden overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-soft)] md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{tr.chooser.title}</caption>
          <thead>
            <tr className="bg-secondary/60">
              <th scope="col" className="px-5 py-4 text-left font-semibold text-primary-deep">
                {tr.chooser.featureColumn}
              </th>
              {mockProducts.map((product) => (
                <th
                  key={product.id}
                  scope="col"
                  className="px-5 py-4 text-left font-semibold text-primary-deep"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn("droplet size-6 shrink-0", stageTone[product.stage])}
                    />
                    {product.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border/60">
                <th scope="row" className="px-5 py-3.5 text-left font-medium text-muted-foreground">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td key={index} className="px-5 py-3.5 text-primary-deep/85">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil: ürün başına kart */}
      <div className="mt-10 grid gap-5 md:hidden">
        {mockProducts.map((product, productIndex) => (
          <div
            key={product.id}
            className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn("droplet size-8 shrink-0", stageTone[product.stage])}
              />
              <h3 className="min-w-0 text-base font-semibold text-primary-deep">{product.name}</h3>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right text-primary-deep/85">{row.values[productIndex]}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="ghost" className="mt-4 rounded-full px-3">
              <Link to="/urunler/$slug" params={{ slug: product.slug }}>
                {tr.products.detailsCta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ))}
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
