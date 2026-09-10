import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tr } from "@/content/tr";
import type { LegalDocumentRecord } from "@/lib/legal.functions";

type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/**
 * Yönetim panelinden girilen metni basit bir biçimlendirmeyle gösterir:
 * "## " başlık, "- " madde işareti, boş satır paragraf ayırıcı, **kalın**.
 */
function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** **kalın** işaretlerini güvenli biçimde React düğümlerine çevirir. */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-primary-deep">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function LegalArticle({
  document,
  fallbackTitle,
}: {
  document: LegalDocumentRecord | null;
  fallbackTitle: string;
}) {
  const blocks = document ? parseBlocks(document.body) : [];

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <h1 className="text-3xl font-semibold text-primary-deep sm:text-4xl">
        {document?.title ?? fallbackTitle}
      </h1>

      {document?.summary ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {document.summary}
        </p>
      ) : null}

      {document ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {document.effectiveDate
            ? `${tr.legal.effectiveDate}: ${new Date(document.effectiveDate).toLocaleDateString("tr-TR")}`
            : null}
          {document.effectiveDate ? " · " : ""}
          {tr.legal.lastUpdated}: {new Date(document.updatedAt).toLocaleDateString("tr-TR")}
        </p>
      ) : null}

      {document && blocks.length > 0 ? (
        <div className="mt-10 space-y-6">
          {blocks.map((block, index) => {
            if (block.kind === "heading") {
              return (
                <h2
                  key={index}
                  className="pt-2 text-lg font-semibold text-primary-deep sm:text-xl"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.kind === "list") {
              return (
                <ul key={index} className="space-y-2 pl-5">
                  {block.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="list-disc text-sm leading-relaxed text-muted-foreground sm:text-base"
                    >
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={index}
                className="text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {renderInline(block.text)}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{tr.legal.empty}</p>
        </div>
      )}

      <div className="mt-12">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/">
            <ArrowLeft aria-hidden="true" />
            {tr.nav.home}
          </Link>
        </Button>
      </div>
    </main>
  );
}
