import { Info, LifeBuoy, Package, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { tr } from "@/content/tr";

const icons: LucideIcon[] = [Info, ShieldCheck, Package, LifeBuoy];
const tones = ["primary", "stage-2", "champagne", "stage-1"] as const;

export function TrustSection() {
  return (
    <section className="surface-milk grain border-y border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <SectionHeading
          align="center"
          eyebrow={tr.trust.eyebrow}
          title={tr.trust.title}
          description={tr.trust.description}
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tr.trust.items.map((item, index) => (
            <li
              key={item.title}
              className="lift-hover flex flex-col gap-4 rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-[var(--shadow-soft)]"
            >
              <Icon3D icon={icons[index]!} tone={tones[index]!} />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-primary-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
