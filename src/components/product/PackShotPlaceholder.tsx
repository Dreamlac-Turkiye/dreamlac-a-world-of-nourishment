import { ImageOff } from "lucide-react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { tr } from "@/content/tr";

const stageBg: Record<Product["stage"], string> = {
  "stage-1": "bg-stage-1",
  "stage-2": "bg-stage-2",
  "stage-3": "bg-stage-3",
};

/**
 * AMBALAJ GÖRSELİ YER TUTUCUSU
 * Orijinal görseller geldiğinde `product.image.src` doldurulması yeterlidir;
 * bu bileşen otomatik olarak gerçek görseli gösterir.
 * Uydurma ambalaj çizimi kullanılmaz.
 */
export function PackShotPlaceholder({
  product,
  className,
  label,
}: {
  product: Product;
  className?: string;
  label?: string;
}) {
  if (product.image.src) {
    return (
      <img
        src={product.image.src}
        alt={product.image.alt}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative grid h-full w-full place-items-center overflow-hidden rounded-[1.75rem]",
        stageBg[product.stage],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-8 size-32 rounded-full bg-[oklch(1_0_0/0.5)] blur-2xl"
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <span className="droplet grid size-14 place-items-center bg-[oklch(1_0_0/0.75)] text-primary-deep">
          <ImageOff size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="text-xs font-medium text-primary-deep/80">
          {label ?? tr.products.imageMissing}
        </span>
        <span className="text-[0.7rem] text-primary-deep/60">{product.packagingNote}</span>
      </div>
    </div>
  );
}
