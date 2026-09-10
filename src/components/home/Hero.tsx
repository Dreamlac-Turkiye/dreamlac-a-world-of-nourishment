import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Droplets } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoPlaceholder } from "@/components/brand/LogoPlaceholder";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { mockProducts } from "@/data/mock/products";
import { PackShotPlaceholder } from "@/components/product/PackShotPlaceholder";

/** Fare hareketine göre çok hafif parallax (yalnızca geniş ekranlarda). */
function usePointerTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const enabled = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
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

  return (
    <section className="bg-hero-aura grain relative overflow-hidden">
      {/* Organik 3D formlar — süt damlası ve bulut esintisi */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="droplet animate-float-slow absolute -top-24 -left-16 size-72 bg-[image:var(--gradient-milk)] opacity-80 md:size-96"
          style={{ transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 0)` }}
        />
        <div
          className="droplet animate-float-slow absolute top-40 -right-20 size-64 bg-champagne/45 opacity-70 md:size-80"
          style={{ transform: `translate3d(${tilt.x * 18}px, ${tilt.y * 12}px, 0)`, animationDelay: "1.4s" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-20 lg:pb-28">
        <div className="animate-rise-in min-w-0">
          <div className="surface-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary-deep">
            <Droplets size={14} strokeWidth={1.8} aria-hidden="true" className="text-primary" />
            {tr.hero.eyebrow}
          </div>


          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold text-primary-deep sm:text-5xl lg:text-6xl">
            {tr.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {tr.hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-[var(--shadow-glow)]">
              <Link to="/urunler">
                {tr.hero.primaryCta}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-7 text-base">
              <Link to="/hakkimizda">{tr.hero.secondaryCta}</Link>
            </Button>
          </div>

          <p className="mt-8 hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <ChevronDown size={14} aria-hidden="true" />
            {tr.hero.scrollHint}
          </p>
        </div>

        {/* Ambalaj görselleri için ayrılmış sahne */}
        <div className="min-w-0">
          <div
            className="surface-glass relative rounded-[2.5rem] p-5 shadow-[var(--shadow-deep)] sm:p-7"
            style={{
              transform: `perspective(1200px) rotateY(${tilt.x * 2.2}deg) rotateX(${tilt.y * -1.6}deg)`,
              transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {mockProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="aspect-square overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-lifted)] sm:aspect-2/3"
                  style={{ transform: `translateY(${index === 1 ? -14 : 0}px)` }}
                >
                  <PackShotPlaceholder product={product} label={product.name} />
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
              {tr.hero.visualNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
