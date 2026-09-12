import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Info, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PackShotPlaceholder } from "@/components/product/PackShotPlaceholder";
import { tr } from "@/content/tr";
import { mockProducts } from "@/data/mock/products";
import { cn } from "@/lib/utils";

const stageStyles = [
  {
    glow: "bg-[oklch(0.82_0.105_215/0.72)]",
    active: "border-[oklch(0.68_0.12_215)] bg-[oklch(0.94_0.035_215)] text-primary-deep",
  },
  {
    glow: "bg-[oklch(0.79_0.09_305/0.58)]",
    active: "border-[oklch(0.66_0.1_305)] bg-[oklch(0.95_0.03_305)] text-primary-deep",
  },
  {
    glow: "bg-[oklch(0.82_0.09_35/0.58)]",
    active: "border-[oklch(0.7_0.1_35)] bg-[oklch(0.96_0.03_35)] text-primary-deep",
  },
] as const;

function usePointerTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const enabled = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    enabled.current = media.matches;
    if (!enabled.current) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setTilt({
          x: (event.clientX / window.innerWidth - 0.5) * 2,
          y: (event.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return tilt;
}

export function Hero() {
  const tilt = usePointerTilt();
  const [activeStage, setActiveStage] = useState(0);
  const activeProduct = mockProducts[activeStage]!;

  return (
    <>
      <section className="hero-premium grain relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute -top-40 -left-48 size-[34rem] rounded-full bg-primary-soft/70 blur-[100px]" />
          <div
            className={cn(
              "absolute top-20 -right-28 size-[30rem] rounded-full blur-[100px] transition-colors duration-700",
              stageStyles[activeStage]!.glow,
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-8 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:pt-12 lg:pb-20">
          <div className="animate-rise-in relative z-10 min-w-0 lg:py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.16em] text-primary-deep uppercase shadow-[var(--shadow-soft)] backdrop-blur-xl sm:text-xs">
              <Sparkles size={14} strokeWidth={1.7} aria-hidden="true" className="text-primary" />
              {tr.hero.eyebrow}
            </div>

            <h1 className="mt-6 max-w-2xl text-[clamp(2.7rem,7vw,5.7rem)] leading-[0.94] font-semibold tracking-[-0.045em] text-primary-deep">
              {tr.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {tr.hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-13 rounded-full px-7 text-base shadow-[var(--shadow-glow)]"
              >
                <Link to="/urunler">
                  {tr.hero.primaryCta}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-primary-deep/12 bg-card/60 px-7 text-base shadow-[var(--shadow-soft)] backdrop-blur"
              >
                <a href="#urunler">{tr.hero.secondaryCta}</a>
              </Button>
            </div>

            <ul className="mt-8 grid max-w-xl grid-cols-2 gap-x-5 gap-y-3 border-t border-primary-deep/10 pt-6 sm:flex sm:flex-wrap">
              {tr.hero.trustItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs font-medium text-primary-deep/75"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <Check size={12} strokeWidth={2.3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[30rem] min-w-0 sm:min-h-[36rem] lg:min-h-[43rem]">
            <div
              aria-hidden="true"
              className={cn(
                "absolute top-[12%] left-1/2 aspect-square w-[78%] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700 sm:w-[68%]",
                stageStyles[activeStage]!.glow,
              )}
            />
            <div
              aria-hidden="true"
              className="absolute top-[18%] left-1/2 aspect-square w-[62%] -translate-x-1/2 rounded-full border border-white/70 bg-white/18 shadow-[inset_0_0_80px_rgba(255,255,255,0.5)] backdrop-blur-[2px]"
            />

            <div className="absolute inset-x-0 top-0 bottom-24 lg:hidden">
              <div
                key={activeProduct.id}
                className="hero-product-enter mx-auto h-full max-w-[22rem]"
              >
                <PackShotPlaceholder product={activeProduct} priority />
              </div>
            </div>

            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                transform: `perspective(1200px) rotateY(${tilt.x * 1.8}deg) rotateX(${tilt.y * -1.2}deg)`,
                transition: "transform 500ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {mockProducts.map((product, index) => {
                const positions = [
                  "left-[0%] top-[17%] z-10 h-[67%] -rotate-[5deg] opacity-90",
                  "left-[25%] top-[2%] z-30 h-[82%]",
                  "right-[-2%] top-[17%] z-20 h-[67%] rotate-[5deg] opacity-90",
                ];
                return (
                  <Link
                    key={product.id}
                    to="/urunler/$slug"
                    params={{ slug: product.slug }}
                    aria-label={product.name}
                    className={cn(
                      "animate-float-product absolute w-[49%] transition-transform duration-500 hover:z-40 hover:scale-105",
                      positions[index],
                    )}
                    style={{ animationDelay: `${index * 0.8}s` }}
                  >
                    <PackShotPlaceholder product={product} priority={index === 1} />
                  </Link>
                );
              })}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-[1.6rem] border border-white/70 bg-card/70 p-2.5 shadow-[var(--shadow-lifted)] backdrop-blur-2xl lg:hidden">
              <div
                className="grid grid-cols-3 gap-1.5"
                role="tablist"
                aria-label={tr.hero.stageSelectorLabel}
              >
                {mockProducts.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    role="tab"
                    aria-selected={activeStage === index}
                    onClick={() => setActiveStage(index)}
                    className={cn(
                      "rounded-[1.15rem] border border-transparent px-2 py-2.5 text-center transition-all",
                      activeStage === index
                        ? stageStyles[index]!.active
                        : "text-muted-foreground hover:bg-card/70",
                    )}
                  >
                    <span className="block text-[0.65rem] font-semibold tracking-[0.14em] uppercase">
                      Dreamlac
                    </span>
                    <span className="mt-0.5 block text-lg font-semibold leading-none">
                      {index + 1}
                    </span>
                    <span className="mt-1 block text-[0.62rem] leading-tight">
                      {product.ageRange}
                    </span>
                  </button>
                ))}
              </div>
              <Button asChild size="sm" className="mt-2.5 w-full rounded-full">
                <Link to="/urunler/$slug" params={{ slug: activeProduct.slug }}>
                  {activeProduct.name}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <aside
        className="relative z-20 mx-auto -mt-1 max-w-7xl px-4 sm:px-6"
        aria-label={tr.hero.noticeLabel}
      >
        <div className="flex items-start gap-3 rounded-2xl border border-champagne/60 bg-[color-mix(in_oklab,var(--champagne)_20%,var(--card))] px-4 py-3.5 text-xs leading-relaxed text-champagne-foreground shadow-[var(--shadow-soft)] sm:items-center sm:px-5 sm:text-sm">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-champagne-foreground sm:mt-0"
            aria-hidden="true"
          />
          <p>{tr.hero.notice}</p>
        </div>
      </aside>
    </>
  );
}
