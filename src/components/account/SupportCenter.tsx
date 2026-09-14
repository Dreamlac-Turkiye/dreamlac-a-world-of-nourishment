import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Headphones } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSupportTicket,
  listMySupportTickets,
  replySupportTicket,
} from "@/lib/support.functions";

export function SupportCenter() {
  const read = useServerFn(listMySupportTickets),
    create = useServerFn(createSupportTicket),
    reply = useServerFn(replySupportTicket);
  const tickets = useQuery({ queryKey: ["account", "support"], queryFn: () => read() });
  const [subject, setSubject] = useState(""),
    [body, setBody] = useState(""),
    [orderNumber, setOrderNumber] = useState(""),
    [category, setCategory] = useState<
      "order" | "product" | "delivery" | "payment" | "return" | "other"
    >("order"),
    [busy, setBusy] = useState(false),
    [replyBody, setReplyBody] = useState<Record<string, string>>({});
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await create({ data: { subject, body, orderNumber, category } });
      toast.success(`Destek talebiniz oluşturuldu: ${result.ticketNumber}`);
      setSubject("");
      setBody("");
      setOrderNumber("");
      await tickets.refetch();
    } catch {
      toast.error("Destek talebi oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }
  async function sendReply(ticketNumber: string) {
    const text = replyBody[ticketNumber]?.trim();
    if (!text) return;
    setBusy(true);
    try {
      await reply({ data: { ticketNumber, body: text } });
      setReplyBody((v) => ({ ...v, [ticketNumber]: "" }));
      await tickets.refetch();
      toast.success("Yanıtınız gönderildi.");
    } catch {
      toast.error("Yanıt gönderilemedi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-8 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-2">
        <Headphones size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-primary-deep">Destek merkezi</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Sipariş, ürün, teslimat veya iade konusunda ekibimize ulaşın.
      </p>
      <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <div className="space-y-1">
          <Label htmlFor="support-subject">Konu</Label>
          <Input
            id="support-subject"
            required
            minLength={3}
            maxLength={160}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="support-category">Kategori</Label>
          <select
            id="support-category"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            <option value="order">Sipariş</option>
            <option value="product">Ürün</option>
            <option value="delivery">Teslimat</option>
            <option value="payment">Ödeme</option>
            <option value="return">İade</option>
            <option value="other">Diğer</option>
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="support-order">Sipariş numarası (isteğe bağlı)</Label>
          <Input
            id="support-order"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="support-body">Mesajınız</Label>
          <Textarea
            id="support-body"
            required
            maxLength={4000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <Button type="submit" className="rounded-full sm:w-fit" disabled={busy}>
          Talep oluştur
        </Button>
      </form>
      <div className="mt-7 space-y-4">
        {tickets.data?.map((t) => (
          <article key={t.id} className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <strong className="text-sm text-primary-deep">
                {t.ticketNumber} · {t.subject}
              </strong>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">{t.status}</span>
            </div>
            <div className="mt-3 space-y-2">
              {t.messages.map((m) => (
                <p
                  key={m.id}
                  className={`rounded-xl p-3 text-sm ${m.authorType === "staff" ? "bg-primary/10" : "bg-secondary/60"}`}
                >
                  <span className="mb-1 block text-xs font-medium">
                    {m.authorType === "staff" ? "Dreamlac Destek" : "Siz"}
                  </span>
                  {m.body}
                </p>
              ))}
            </div>
            {t.status !== "closed" ? (
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Yanıt yazın"
                  maxLength={4000}
                  value={replyBody[t.ticketNumber] ?? ""}
                  onChange={(e) =>
                    setReplyBody((v) => ({ ...v, [t.ticketNumber]: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => void sendReply(t.ticketNumber)}
                >
                  Gönder
                </Button>
              </div>
            ) : null}
          </article>
        ))}
        {tickets.isLoading ? (
          <p className="text-sm text-muted-foreground">Talepler yükleniyor…</p>
        ) : null}
      </div>
    </section>
  );
}
