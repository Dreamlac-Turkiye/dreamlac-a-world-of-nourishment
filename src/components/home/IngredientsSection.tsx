import { Droplet, Leaf, Microscope, Sparkles, Sprout } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { tr } from "@/content/tr";
import { getIngredientCards } from "@/services/catalog";

const icons: LucideIcon[] = [Droplet, Microscope, Sparkles, Sprout, Leaf];
const tones = ["primary", "stage-2", "champagne", "stage-1", "stage-3"] as const;

/** Bileşen kartları — yalnızca onaylı katalog ifadeleri, sağlık iddiası yok. */
export function IngredientsSection() {
  const cards = getIngredientCards();

  return (
    <section className="surface-milk grain border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          align="center"
          eyebrow={tr.ingredients.eyebrow}
          title={tr.ingredients.title}
          description={tr.ingredients.description}
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <li
              key={card.id}
              className="lift-hover flex flex-col gap-4 rounded-[1.75rem] border border-border/60 bg-card/85 p-6 shadow-[var(--shadow-soft)]"
            >
              <Icon3D icon={icons[index % icons.length]!} tone={tones[index % tones.length]!} />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-primary-deep">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </li>
          ))}

          <li className="flex flex-col justify-center gap-4 rounded-[1.75rem] border border-champagne/70 bg-champagne/25 p-6">
            <h3 className="text-base font-semibold text-champagne-foreground">
              {tr.ingredients.featuresTitle}
            </h3>
            <ul className="space-y-2">
              {tr.ingredients.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2.5 text-sm font-medium text-champagne-foreground"
                >
                  <span aria-hidden="true" className="droplet size-3 bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </li>
        </ul>

        <p className="mt-8 text-center text-sm text-muted-foreground">{tr.ingredients.note}</p>
      </div>
    </section>
  );
}
