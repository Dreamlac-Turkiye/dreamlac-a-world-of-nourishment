import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { company } from "@/data/company";

/** Marka hikâyesi — metinler onaylı katalog içeriğinden alınmıştır. */
export function StorySection() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="droplet animate-float-slow absolute -right-24 top-10 size-72 bg-[image:var(--gradient-milk)] opacity-70" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="min-w-0">
            <SectionHeading
              eyebrow={tr.story.eyebrow}
              title={tr.story.title}
              description={tr.story.description}
            />
            <div className="mt-6 space-y-4">
              {tr.story.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <Button asChild className="mt-7 h-12 rounded-full px-6">
              <Link to="/hakkimizda">
                {tr.story.cta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="surface-glass min-w-0 rounded-[2rem] p-7 shadow-[var(--shadow-deep)]">
            <Icon3D icon={Sparkles} tone="champagne" />
            <blockquote className="mt-5 text-xl font-semibold leading-snug text-primary-deep sm:text-2xl">
              {tr.story.headline}
            </blockquote>
            <hr className="my-6 border-border/70" />
            <h3 className="text-base font-semibold text-primary-deep">{tr.story.missionTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tr.story.missionText}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Fransa</dt>
                <dd className="mt-1 text-lg font-semibold text-primary-deep">
                  {company.foundedFrance}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Türkiye</dt>
                <dd className="mt-1 text-lg font-semibold text-primary-deep">
                  {company.foundedTurkey}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
