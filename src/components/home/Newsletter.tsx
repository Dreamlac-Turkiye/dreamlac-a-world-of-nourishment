import { Mail } from "lucide-react";
import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Icon3D } from "@/components/brand/Icon3D";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tr } from "@/content/tr";
import { requestNewsletterSubscription } from "@/lib/newsletter.functions";

export function Newsletter() {
  const subscribe = useServerFn(requestNewsletterSubscription);
  const emailId = useId();
  const consentId = useId();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(tr.newsletter.invalidEmail);
      return;
    }
    if (!consent) {
      setError(tr.newsletter.consentRequired);
      return;
    }
    setError(null);
    setPending(true);
    try {
      await subscribe({ data: { email, marketingConsent: true } });
      setDone(true);
      setEmail("");
      setConsent(false);
    } catch {
      setError(tr.states.networkError);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
      <div className="surface-glass grain relative overflow-hidden rounded-[2.25rem] p-6 shadow-[var(--shadow-lifted)] sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="droplet absolute -top-16 right-6 size-48 bg-primary-soft/70 opacity-70" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="min-w-0">
            <Icon3D icon={Mail} tone="primary" />
            <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {tr.newsletter.eyebrow}
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-primary-deep sm:text-3xl">
              {tr.newsletter.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tr.newsletter.description}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={emailId}>{tr.newsletter.emailLabel}</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={tr.newsletter.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className="h-12 rounded-full bg-card px-5"
                />
                <Button type="submit" disabled={pending} className="h-12 rounded-full px-7">
                  {pending ? tr.states.loading : tr.newsletter.submit}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id={consentId}
                checked={consent}
                onCheckedChange={(value) => setConsent(value === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor={consentId}
                className="text-sm leading-relaxed font-normal text-muted-foreground"
              >
                {tr.newsletter.consent}
              </Label>
            </div>

            {error ? (
              <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
            {done ? (
              <p role="status" className="text-sm font-medium text-success">
                {tr.newsletter.success}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground/80">{tr.newsletter.privacyNote}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
