import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 3D Icon Wrapper — ikonu yumuşak, katmanlı ve derinlikli bir kapsül içinde sunar.
 * Emoji veya düz ikon kullanılmaz; tüm ikonlar bu sarmalayıcı ile tutarlı görünür.
 */
export function Icon3D({
  icon: Icon,
  className,
  tone = "primary",
  size = "md",
}: {
  icon: LucideIcon;
  className?: string;
  tone?: "primary" | "champagne" | "stage-1" | "stage-2" | "stage-3";
  size?: "sm" | "md" | "lg";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-soft text-primary-deep",
    champagne: "bg-champagne/60 text-champagne-foreground",
    "stage-1": "bg-stage-1 text-primary-deep",
    "stage-2": "bg-stage-2 text-primary-deep",
    "stage-3": "bg-stage-3 text-champagne-foreground",
  };
  const sizes = {
    sm: "size-10 rounded-2xl",
    md: "size-14 rounded-[1.35rem]",
    lg: "size-16 rounded-[1.6rem]",
  } as const;
  const iconSizes = { sm: 18, md: 24, lg: 28 } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center shadow-[var(--shadow-lifted)]",
        "before:absolute before:inset-x-1.5 before:top-1 before:h-1/2 before:rounded-[inherit] before:bg-[oklch(1_0_0/0.55)] before:content-['']",
        "after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-[oklch(1_0_0/0.6)] after:content-['']",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <Icon size={iconSizes[size]} strokeWidth={1.6} className="relative z-10" />
    </span>
  );
}
