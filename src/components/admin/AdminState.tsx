import { AlertCircle, Loader2 } from "lucide-react";

export function AdminState({
  kind,
  message,
  onRetry,
}: {
  kind: "loading" | "error" | "empty";
  message: string;
  onRetry?: (() => void) | undefined;
}) {
  if (kind === "loading") {
    return (
      <div
        className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        {message}
      </div>
    );
  }
  if (kind === "error") {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        role="alert"
        aria-live="assertive"
      >
        <span className="flex items-center gap-2">
          <AlertCircle size={16} aria-hidden="true" />
          {message}
        </span>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-current px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <p
      className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
