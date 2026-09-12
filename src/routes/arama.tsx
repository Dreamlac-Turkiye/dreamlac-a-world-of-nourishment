import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/catalog";

export const Route = createFileRoute("/arama")({
  loader: () => getProducts(),
  head: () => ({
    meta: [
      { title: "Arama — Dreamlac" },
      { name: "description", content: "Dreamlac ürünleri ve yaş dönemleri içinde arama yapın." },
      { property: "og:title", content: "Arama — Dreamlac" },
      {
        property: "og:description",
        content: "Dreamlac ürünleri ve yaş dönemleri içinde arama yapın.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const products = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.toLocaleLowerCase("tr-TR").trim();
    if (!normalized) return products;
    return products.filter((product) =>
      [
        product.name,
        product.technicalName,
        product.ageRange,
        product.shortDescription,
        ...product.highlightedIngredients,
        ...product.formulaFeatures,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(normalized),
    );
  }, [products, query]);

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">Ara</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Dreamlac ürün ailesinde ürün adı, dönem veya içerik bilgisi arayın.
      </p>
      <div className="relative mt-7 max-w-2xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-11"
          placeholder="Örn. Dreamlac 2, 6-12 ay, GOS…"
          autoFocus
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
        {results.length} sonuç
      </p>
      {results.length ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
          Aramanızla eşleşen ürün bulunamadı.
        </div>
      )}
    </main>
  );
}
