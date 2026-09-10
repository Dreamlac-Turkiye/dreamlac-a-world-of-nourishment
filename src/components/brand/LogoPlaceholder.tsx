import { cn } from "@/lib/utils";
import { tr } from "@/content/tr";

/**
 * LOGO YER TUTUCUSU
 * Resmî Dreamlac logosu iletildiğinde: logoyu src/assets/brand/logo.svg olarak
 * ekleyin ve bu bileşenin içeriğini <img src={logo} … /> ile değiştirin.
 * Başka hiçbir dosyayı değiştirmeniz gerekmez.
 */
export function LogoPlaceholder({
  className,
  showNote = false,
}: {
  className?: string;
  showNote?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label={tr.brand.name}>
      <span
        aria-hidden="true"
        className="droplet grid size-9 shrink-0 place-items-center bg-[image:var(--gradient-primary)] text-[0.95rem] font-semibold text-primary-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        D
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className="truncate text-lg font-semibold tracking-tight text-primary-deep"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {tr.brand.name}
        </span>
        {showNote ? (
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tr.brand.logoNote}
          </span>
        ) : null}
      </span>
    </span>
  );
}
