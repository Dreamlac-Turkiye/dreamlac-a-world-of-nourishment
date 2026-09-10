import { Clock, Info, ShieldAlert, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tr } from "@/content/tr";
import { company } from "@/data/company";
import type { Product } from "@/types";

const t = tr.productDetail;

function PendingNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-border/70 border-dashed bg-secondary/40 p-5">
      <Info size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-primary-deep">{t.infoPendingTitle}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          value ? "text-sm font-medium text-primary-deep/90" : "text-sm text-muted-foreground/70"
        }
      >
        {value ?? t.pendingShort}
      </dd>
    </div>
  );
}

export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-full bg-secondary/70 p-1">
        <TabsTrigger value="details" className="rounded-full px-4 py-2 text-sm">
          {t.tabs.details}
        </TabsTrigger>
        <TabsTrigger value="preparation" className="rounded-full px-4 py-2 text-sm">
          {t.tabs.preparation}
        </TabsTrigger>
        <TabsTrigger value="nutrition" className="rounded-full px-4 py-2 text-sm">
          {t.tabs.nutrition}
        </TabsTrigger>
      </TabsList>

      {/* 1 — Ürün detayı */}
      <TabsContent value="details" className="mt-6 space-y-6">
        <p className="max-w-3xl text-sm leading-relaxed text-primary-deep/85">
          {product.description}
        </p>

        <dl className="grid gap-x-10 rounded-[1.5rem] border border-border/70 bg-card p-5 sm:grid-cols-2">
          <InfoRow label={t.detailsFields.technicalName} value={product.technicalName} />
          <InfoRow label={t.detailsFields.age} value={product.ageRange} />
          <InfoRow label={t.detailsFields.base} value={t.detailsFields.baseValue} />
          <InfoRow label={t.detailsFields.weight} value={product.weight} />
          <InfoRow label={t.detailsFields.sku} value={product.sku} />
          <InfoRow label={t.detailsFields.barcode} value={product.barcode} />
          <InfoRow label={t.detailsFields.producer} value={company.legalName} />
          <InfoRow label={t.detailsFields.origin} value={company.city} />
        </dl>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-border/70 bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-deep">
              <Sparkles size={16} className="text-primary" aria-hidden="true" />
              {t.ingredientsTitle}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.highlightedIngredients.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary-deep/85"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card p-5">
            <h3 className="text-sm font-semibold text-primary-deep">{t.featuresTitle}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.formulaFeatures.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary-deep/85"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tam bileşen listesi, alerjen, saklama, raf ömrü — veri gelene kadar boş gösterilir. */}
        <dl className="grid gap-x-10 rounded-[1.5rem] border border-border/70 bg-card p-5 sm:grid-cols-2">
          <InfoRow label={t.fullIngredientsTitle} value={product.ingredientsList} />
          <InfoRow label={t.allergensTitle} value={product.allergens} />
          <InfoRow label={t.storageTitle} value={product.storage} />
          <InfoRow label={t.shelfLifeTitle} value={product.shelfLife} />
        </dl>

        {/* Etiket şablonunun kısa görünümü; tamamı Besin Değerleri sekmesinde. */}
        <NutritionLabel product={product} compact />
      </TabsContent>

      {/* 2 — Hazırlama */}
      <TabsContent value="preparation" className="mt-6 space-y-6">
        {product.preparation ? (
          <>
            <ol className="grid gap-4 sm:grid-cols-2">
              {product.preparation.steps.map((step, index) => (
                <li key={step.id} className="rounded-[1.5rem] border border-border/70 bg-card p-5">
                  <span className="text-xs font-semibold text-primary">{`0${index + 1}`}</span>
                  <h3 className="mt-1 text-sm font-semibold text-primary-deep">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
            <div className="overflow-x-auto rounded-[1.5rem] border border-border/70 bg-card">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-secondary/60">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      {t.detailsFields.age}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Su
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Ölçek
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Günlük
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.preparation.dosage.map((row) => (
                    <tr key={row.ageLabel} className="border-t border-border/60">
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        {row.ageLabel}
                      </th>
                      <td className="px-4 py-3">{row.waterMl}</td>
                      <td className="px-4 py-3">{row.scoops}</td>
                      <td className="px-4 py-3">{row.perDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2">
              {product.preparation.hygieneNotes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <PendingNote text={t.preparationPending} />
        )}
      </TabsContent>

      {/* 3 — Besin değerleri: tam etiket şablonu */}
      <TabsContent value="nutrition" className="mt-6 space-y-6">
        {product.nutrition ? null : <PendingNote text={t.nutritionPending} />}
        <NutritionLabel product={product} />
      </TabsContent>

      <div
        role="note"
        className="mt-8 flex items-start gap-3 rounded-[1.5rem] border border-champagne/70 bg-champagne/25 p-5"
      >
        <ShieldAlert
          size={18}
          className="mt-0.5 shrink-0 text-champagne-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-champagne-foreground">{t.warningTitle}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-champagne-foreground/90">
            {product.warning}
          </p>
        </div>
      </div>
    </Tabs>
  );
}
