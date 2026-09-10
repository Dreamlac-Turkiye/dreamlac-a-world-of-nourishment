import { Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, FileCheck2, Microscope, Route, ShieldCheck, Thermometer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";

const icons: LucideIcon[] = [Microscope, ShieldCheck, Route, Thermometer, Boxes, FileCheck2];

export function QualitySection() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-secondary/45">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="droplet absolute -bottom-24 left-1/4 size-80 bg-[image:var(--gradient-milk)] opacity-60" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div className="min-w-0">
            <SectionHeading
              eyebrow={tr.quality.eyebrow}
              title={tr.quality.title}
              description={tr.quality.description}
            />
            <p className="mt-5 max-w-md text-sm text-muted-foreground/90">{tr.quality.note}</p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link to="/kalite-ve-guvenlik">
                {tr.quality.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {tr.quality.items.map((item, index) => (
              <li
                key={item.title}
                className="surface-glass flex items-start gap-3 rounded-[1.5rem] p-5 shadow-[var(--shadow-soft)]"
              >
                <Icon3D icon={icons[index]!} size="sm" tone={index % 2 === 0 ? "primary" : "stage-2"} />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-primary-deep">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
