import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Icon3D } from "@/components/brand/Icon3D";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon = Inbox,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className,
      )}
    >
      <Icon3D icon={icon} />
      <div className="space-y-1.5">
        <p className="font-semibold text-primary-deep">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
