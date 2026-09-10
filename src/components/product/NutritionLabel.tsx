import { FileText } from "lucide-react";
import { tr } from "@/content/tr";
import { nutritionLabelRowCount, nutritionLabelTemplate } from "@/data/mock/nutrition-label";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const t = tr.productDetail;
const l = tr.productDetail.nutritionLabel;

/**
 * Ürün etiketi görünümünde besin değerleri şablonu.
 * Satır adları sabittir; değerler yalnızca resmî veri (product.nutrition) geldiğinde dolar.
 * Veri yoksa "—" gösterilir; hiçbir sayı uydurulmaz.
 */
export function NutritionLabel({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const values = new Map((product.nutrition ?? []).map((row) => [row.label, row]));
  const filledCount = nutritionLabelTemplate.reduce(
    (total, section) => total + section.rows.filter((row) => values.has(row.label)).length,
    0,
  );
  const isReady = filledCount > 0;
  const sections = compact ? nutritionLabelTemplate.slice(0, 2) : nutritionLabelTemplate;

  return (
    <section
      aria-label={`${product.name} — ${l.title}`}
      className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 bg-secondary/50 px-5 py-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-deep">
            <FileText size={16} className="text-primary" aria-hidden="true" />
            {l.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {product.name} · {product.technicalName} · {product.ageRange}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isReady ? "bg-success/12 text-success" : "bg-secondary text-muted-foreground",
          )}
        >
          {isReady ? l.readyBadge : l.pendingBadge}
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{`${product.name} ${l.title}`}</caption>
          <thead>
            <tr className="border-b border-border/60">
              <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold">
                {t.nutritionColumns.nutrient}
              </th>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold">
                {l.unitColumn}
              </th>
              <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold">
                {t.nutritionColumns.per100g}
              </th>
              <th scope="col" className="px-5 py-2.5 text-left text-xs font-semibold">
                {t.nutritionColumns.per100ml}
              </th>
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section.id}>
              <tr className="bg-secondary/30">
                <th
                  scope="colgroup"
                  colSpan={4}
                  className="px-5 py-2 text-left text-xs font-semibold tracking-[0.12em] text-primary uppercase"
                >
                  {section.title}
                </th>
              </tr>
              {section.rows.map((row) => {
                const value = values.get(row.label);
                return (
                  <tr key={`${section.id}-${row.label}`} className="border-t border-border/50">
                    <th
                      scope="row"
                      className={cn(
                        "px-5 py-2 text-left font-medium text-primary-deep/90",
                        row.indented && "pl-9 font-normal text-muted-foreground",
                      )}
                    >
                      {row.label}
                    </th>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{row.unit}</td>
                    <td className={cn("px-4 py-2", !value && "text-muted-foreground/60")}>
                      {value?.per100g ?? "—"}
                    </td>
                    <td className={cn("px-5 py-2", !value && "text-muted-foreground/60")}>
                      {value?.per100ml ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>

      <footer className="border-t border-border/60 bg-secondary/30 px-5 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {compact ? l.compactNote : l.note}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground/80">
          {l.progress
            .replace("{filled}", String(filledCount))
            .replace("{total}", String(nutritionLabelRowCount))}
        </p>
      </footer>
    </section>
  );
}
