import logo from "@/assets/brand/dreamlac-logo.png";
import { cn } from "@/lib/utils";
import { tr } from "@/content/tr";

/**
 * Resmî Dreamlac logosu (şeffaf arka planlı).
 */
export function LogoPlaceholder({ className }: { className?: string; showNote?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={logo}
        alt={tr.brand.name}
        className="h-6 w-auto sm:h-7 lg:h-8"
        decoding="async"
        loading="eager"
      />
    </span>
  );
}
