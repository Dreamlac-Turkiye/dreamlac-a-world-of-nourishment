import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminState } from "@/components/admin/AdminState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const slugify = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[^\\p{L}\\p{N}\\s-]/gu, "")
    .trim()
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-");

import {
  listAdminContent,
  saveAdminContent,
  type AdminContentEntry,
} from "@/lib/admin-content.functions";
export function ContentManagementSection() {
  const list = useServerFn(listAdminContent),
    save = useServerFn(saveAdminContent);
  const q = useQuery({
    queryKey: ["admin", "content"],
    queryFn: () => list({ data: { market: "TR" } }),
  });
  const [edit, setEdit] = useState<AdminContentEntry | null | undefined>();
  const blank = {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "Genel",
    seoTitle: "",
    seoDescription: "",
    status: "draft" as AdminContentEntry["status"],
  };
  const [f, setF] = useState(blank);
  function open(v: AdminContentEntry | null) {
    setEdit(v);
    setF(
      v
        ? {
            title: v.title,
            slug: v.slug,
            excerpt: v.excerpt,
            body: v.body,
            category: v.category,
            seoTitle: v.seoTitle ?? "",
            seoDescription: v.seoDescription ?? "",
            status: v.status,
          }
        : blank,
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save({
        data: {
          id: edit?.id ?? null,
          market: "TR",
          locale: "tr-TR",
          contentType: "article",
          slug: slugify(f.slug),
          title: f.title,
          excerpt: f.excerpt,
          body: f.body,
          category: f.category,
          seoTitle: f.seoTitle || null,
          seoDescription: f.seoDescription || null,
          canonicalPath: `/bilgi-merkezi/${f.slug}`,
          coverImageUrl: null,
          status: f.status,
        },
      });
      toast.success("İçerik kaydedildi.");
      setEdit(undefined);
      void q.refetch();
    } catch {
      toast.error("İçerik kaydedilemedi. Alanları kontrol edin.");
    }
  }
  return (
    <section
      id="icerik"
      className="mt-10 scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6"
    >
      <div className="flex justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary-deep">
            <FileText className="text-primary" />
            İçerik ve SEO
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Taslak, inceleme ve yayın akışını yönetin.
          </p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => open(null)}>
          <Plus size={14} />
          Yeni içerik
        </Button>
      </div>
      {edit !== undefined ? (
        <form
          className="mt-5 grid gap-3 rounded-2xl bg-secondary/50 p-4 sm:grid-cols-2"
          onSubmit={submit}
        >
          <F l="Başlık">
            <Input
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              required
            />
          </F>
          <F l="URL adı">
            <Input
              value={f.slug}
              onChange={(e) => setF({ ...f, slug: slugify(e.target.value) })}
              maxLength={120}
              required
            />
          </F>
          <F l="Kategori">
            <Input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          </F>
          <F l="Durum">
            <select
              className="h-10 w-full rounded-xl border bg-background px-3"
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value as typeof f.status })}
            >
              <option value="draft">Taslak</option>
              <option value="review">İncelemede</option>
              <option value="published">Yayında</option>
              <option value="archived">Arşiv</option>
            </select>
          </F>
          <div className="sm:col-span-2">
            <F l={`Özet (${f.excerpt.length}/320)`}>
              <Textarea
                value={f.excerpt}
                maxLength={320}
                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
              />
            </F>
          </div>
          <div className="sm:col-span-2">
            <F l="İçerik">
              <Textarea
                rows={10}
                value={f.body}
                onChange={(e) => setF({ ...f, body: e.target.value })}
              />
            </F>
          </div>
          <F l={`SEO başlığı (${f.seoTitle.length}/60)`}>
            <Input
              value={f.seoTitle}
              maxLength={60}
              onChange={(e) => setF({ ...f, seoTitle: e.target.value })}
            />
          </F>
          <F l={`Meta açıklama (${f.seoDescription.length}/160)`}>
            <Textarea
              value={f.seoDescription}
              maxLength={160}
              onChange={(e) => setF({ ...f, seoDescription: e.target.value })}
            />
          </F>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Kaydet</Button>
            <Button type="button" variant="outline" onClick={() => setEdit(undefined)}>
              Vazgeç
            </Button>
          </div>
        </form>
      ) : null}
      <div className="mt-5 space-y-2">
        {q.isLoading ? (
          <AdminState kind="loading" message="İçerikler yükleniyor…" />
        ) : q.isError ? (
          <AdminState
            kind="error"
            message="İçerik listesi alınamadı."
            onRetry={() => void q.refetch()}
          />
        ) : q.data?.length ? (
          q.data.map((x) => (
            <button
              key={x.id}
              onClick={() => open(x)}
              className="flex w-full justify-between rounded-2xl border p-4 text-left"
            >
              <span>
                <strong className="block text-primary-deep">{x.title}</strong>
                <small className="text-muted-foreground">
                  /{x.slug} · v{x.version}
                </small>
              </span>
              <span className="text-xs text-primary">{x.status}</span>
            </button>
          ))
        ) : (
          <AdminState kind="empty" message="Henüz içerik bulunmuyor." />
        )}
      </div>
    </section>
  );
}
function F({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <Label>{l}</Label>
      {children}
    </label>
  );
}
