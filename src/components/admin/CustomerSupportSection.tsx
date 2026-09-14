import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Headphones, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listAdminSupportTickets,
  updateAdminSupportTicket,
  type SupportTicket,
} from "@/lib/support.functions";

const statusLabels = {
  open: "Açık",
  in_progress: "İşlemde",
  waiting_customer: "Müşteri bekleniyor",
  resolved: "Çözüldü",
  closed: "Kapalı",
} as const;
const priorityLabels = { low: "Düşük", normal: "Normal", high: "Yüksek", urgent: "Acil" } as const;
export function CustomerSupportSection() {
  const read = useServerFn(listAdminSupportTickets),
    update = useServerFn(updateAdminSupportTicket);
  const [query, setQuery] = useState(""),
    [submitted, setSubmitted] = useState(""),
    [status, setStatus] = useState<
      "open" | "in_progress" | "waiting_customer" | "resolved" | "closed" | "all"
    >("all");
  const tickets = useQuery({
    queryKey: ["admin", "support", submitted, status],
    queryFn: () =>
      read({ data: { query: submitted, status: status === "all" ? undefined : status } }),
  });
  return (
    <section className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-2">
        <Headphones size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-primary-deep">Müşteri ve destek merkezi</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Müşteri taleplerini siparişleriyle birlikte arayın, önceliklendirin ve tek kayıtta
        yanıtlayın.
      </p>
      <form
        className="mt-5 grid gap-2 sm:grid-cols-[1fr_12rem_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Talep no, e-posta, sipariş veya konu"
          maxLength={200}
        />
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">Tüm durumlar</option>
          {Object.entries(statusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="rounded-full">
          <Search size={14} className="mr-2" />
          Ara
        </Button>
      </form>
      {tickets.isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Destek kuyruğu yükleniyor…</p>
      ) : tickets.isError ? (
        <p className="mt-5 text-sm text-destructive">Destek kuyruğu alınamadı.</p>
      ) : tickets.data?.length ? (
        <div className="mt-5 space-y-4">
          {tickets.data.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSaved={() => void tickets.refetch()}
              update={update}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Bu filtreyle eşleşen destek talebi bulunmuyor.
        </p>
      )}
    </section>
  );
}
function TicketCard({
  ticket,
  onSaved,
  update,
}: {
  ticket: SupportTicket;
  onSaved: () => void;
  update: ReturnType<typeof useServerFn<typeof updateAdminSupportTicket>>;
}) {
  const [status, setStatus] = useState(ticket.status),
    [priority, setPriority] = useState(ticket.priority),
    [message, setMessage] = useState(""),
    [internal, setInternal] = useState(false),
    [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await update({
        data: { ticketId: ticket.id, status, priority, assignedTo: null, message, internal },
      });
      setMessage("");
      toast.success("Destek talebi güncellendi.");
      onSaved();
    } catch {
      toast.error("Destek talebi güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article
      className={`rounded-2xl border p-4 ${ticket.priority === "urgent" ? "border-destructive/40 bg-destructive/5" : "border-border/60"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <strong className="text-sm text-primary-deep">
            {ticket.ticketNumber} · {ticket.subject}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            {ticket.customerEmail ?? "Kayıtlı müşteri"}
            {ticket.orderNumber ? ` · ${ticket.orderNumber}` : ""} ·{" "}
            {new Date(ticket.updatedAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs">
          {priorityLabels[ticket.priority]}
        </span>
      </div>
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl p-3 text-sm ${m.internal ? "border border-amber-200 bg-amber-50" : m.authorType === "staff" ? "bg-primary/10" : "bg-secondary/60"}`}
          >
            <span className="mb-1 block text-xs font-medium">
              {m.internal ? "Dahili not" : m.authorType === "staff" ? "Destek ekibi" : "Müşteri"}
            </span>
            {m.body}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          {Object.entries(statusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value as typeof priority)}
        >
          {Object.entries(priorityLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <Textarea
        className="mt-3"
        placeholder="Müşteriye yanıt veya dahili not"
        maxLength={4000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />{" "}
        Yalnızca ekip görebilsin
      </label>
      <Button
        type="button"
        className="mt-3 rounded-full"
        disabled={busy}
        onClick={() => void save()}
      >
        {busy ? "Kaydediliyor…" : "Güncelle ve gönder"}
      </Button>
    </article>
  );
}
