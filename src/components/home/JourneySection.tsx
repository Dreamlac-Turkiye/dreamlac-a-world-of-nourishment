import { SectionHeading } from "@/components/common/SectionHeading";
import { tr } from "@/content/tr";
import { getProductionSteps } from "@/services/catalog";

/** Üretim yolculuğu — katalogdaki 6 adım, ek teknik detay eklenmedi. */
export function JourneySection() {
  const steps = getProductionSteps();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <SectionHeading
        eyebrow={tr.journey.eyebrow}
        title={tr.journey.title}
        description={tr.journey.description}
      />

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="lift-hover relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]"
          >
            <span
              aria-hidden="true"
              className="droplet grid size-12 shrink-0 place-items-center bg-primary-soft text-sm font-semibold text-primary-deep"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 text-sm font-semibold text-primary-deep sm:text-base">
              {step.title}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
