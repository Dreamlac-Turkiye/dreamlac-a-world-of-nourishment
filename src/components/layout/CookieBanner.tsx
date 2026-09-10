import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";
import { Icon3D } from "@/components/brand/Icon3D";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";

const STORAGE_KEY = "dreamlac.cookie-choice";

/**
 * Çerez bildirimi. Tercih şu an yalnızca tarayıcıda tutulur;
 * backend hazır olduğunda onay kaydı sunucuya taşınmalıdır (TODO(backend)).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (choice: "all" | "necessary") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* tercih kaydedilemedi */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={tr.cookie.title}
      className="fixed inset-x-3 bottom-3 z-[60] animate-rise-in sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md"
    >
      <div className="surface-glass rounded-3xl p-5 shadow-[var(--shadow-deep)]">
        <div className="flex items-start gap-3">
          <Icon3D icon={Cookie} size="sm" tone="champagne" />
          <div className="min-w-0">
            <p className="font-semibold text-primary-deep">{tr.cookie.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tr.cookie.description}{" "}
              <Link
                to="/cerez-politikasi"
                className="underline underline-offset-4 hover:text-primary-deep"
              >
                {tr.cookie.policy}
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1 rounded-full" onClick={() => decide("all")}>
            {tr.cookie.accept}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => decide("necessary")}
          >
            {tr.cookie.reject}
          </Button>
        </div>
      </div>
    </div>
  );
}
