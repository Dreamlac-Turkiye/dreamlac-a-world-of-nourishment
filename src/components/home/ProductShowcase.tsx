import { Link } from "@tanstack/react-router";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import { getProducts } from "@/services/catalog";

export function ProductShowcase() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  return (
    <section id="urunler" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={tr.products.sectionEyebrow}
          title={tr.products.sectionTitle}
          description={tr.products.sectionDescription}
        />
        <Button asChild variant="ghost" className="self-start rounded-full md:self-end">
          <Link to="/urunler">
            {tr.products.allProducts}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-10">
        {isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={PackageSearch}
            title={tr.states.error}
            description={tr.states.networkError}
            action={
              <Button variant="outline" className="rounded-full" onClick={() => refetch()}>
                {tr.states.retry}
              </Button>
            }
          />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={PackageSearch} title={tr.states.empty} />
        ) : (
          <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((product, index) => (
              <ProductCard key={product.id} product={product} emphasis={index === 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
