import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoPlaceholder } from "@/components/brand/LogoPlaceholder";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/urunler", label: tr.nav.products },
  { to: "/hakkimizda", label: tr.nav.about },
  { to: "/kalite-ve-guvenlik", label: tr.nav.quality },
  { to: "/bilgi-merkezi", label: tr.nav.knowledge },
  { to: "/iletisim", label: tr.nav.contact },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled ? "surface-glass shadow-[var(--shadow-soft)]" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="min-w-0" aria-label={tr.brand.name}>
          <LogoPlaceholder />
        </Link>

        <nav aria-label={tr.nav.menu} className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary-soft/70 hover:text-primary-deep"
                  activeProps={{ className: "bg-primary-soft/80 text-primary-deep" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={tr.nav.search}
          >
            <Link to="/arama">
              <Search aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden rounded-full sm:inline-flex"
            aria-label={tr.nav.account}
          >
            <Link to={signedIn ? "/hesabim" : "/giris"}>
              <User aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={tr.nav.cart}
          >
            <Link to="/sepet" className="relative">
              <ShoppingBag aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.65rem] leading-4 font-semibold text-primary-foreground tabular-nums">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            aria-label={open ? tr.nav.close : tr.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Mobil navigasyon */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/70 bg-card/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav aria-label={tr.nav.menu} className="px-4 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-2xl px-4 text-base font-medium text-primary-deep transition-colors hover:bg-primary-soft/60"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to={signedIn ? "/hesabim" : "/giris"} onClick={() => setOpen(false)}>
                <User aria-hidden="true" />
                {signedIn ? tr.nav.account : tr.auth.signIn}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to={signedIn ? "/siparislerim" : "/sepet"} onClick={() => setOpen(false)}>
                <Heart aria-hidden="true" />
                {signedIn ? tr.orders.title : tr.nav.cart}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
