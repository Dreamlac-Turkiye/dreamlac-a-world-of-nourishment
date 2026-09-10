import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tr } from "@/content/tr";
import { getArticles } from "@/services/catalog";
import type { Article } from "@/types";

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="lift-hover group flex h-full flex-col rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div
        aria-hidden="true"
        className="surface-milk grid h-32 place-items-center rounded-[1.25rem] border border-border/50"
      >
        <span className="droplet size-12 bg-primary-soft" />
      </div>
      <span className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary">
        {article.category}
      </span>
      <h3 className="mt-2 text-base font-semibold text-primary-deep">{article.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {tr.content.readMore}
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </article>
  );
}

export function ContentSection() {
  const { data, isPending, isError } = useQuery({ queryKey: ["articles"], queryFn: getArticles });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={tr.content.eyebrow}
          title={tr.content.title}
          description={tr.content.description}
        />
        <Button asChild variant="ghost" className="self-start rounded-full md:self-end">
          <Link to="/bilgi-merkezi">
            {tr.content.allArticles}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="mt-10">
        {isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-[1.75rem]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState icon={BookOpen} title={tr.states.error} description={tr.states.retry} />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={BookOpen} title={tr.content.comingSoon} />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((article) => (
              <li key={article.id} className="min-w-0">
                <Link
                  to="/bilgi-merkezi"
                  className="block h-full rounded-[1.75rem] focus-visible:outline-none"
                  aria-label={article.title}
                >
                  <ArticleCard article={article} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
