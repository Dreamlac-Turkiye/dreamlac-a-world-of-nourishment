import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Boxes, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adjustCommerceInventory,
  listCommerceInventory,
  type AdminInventoryItem,
} from "@/lib/admin-commerce.functions";

export function InventoryManagementSection() {
  const readInventory = useServerFn(listCommerceInventory);
  const inventory = useQuery({
    queryKey: ["admin", "inventory", "TR"],
    queryFn: () => readInventory({ data: { market: "TR" } }),
  });

  return (
    <section className="mt-10 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Boxes size={20} className="text-primary" />
            <h2 className="text-xl font-semibold text-primary-deep">Gerçek stok yönetimi</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Depodaki fiziksel, ayrılmış ve satışa hazır miktarları güvenli biçimde yönetin.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => void inventory.refetch()}
        >
          <RefreshCw size={14} className="mr-2" /> Yenile
        </Button>
      </div>

      {inventory.isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Stoklar yükleniyor…</p>
      ) : inventory.isError ? (
        <p className="mt-5 text-sm text-destructive">Stok verileri alınamadı.</p>
      ) : inventory.data?.length ? (
        <div className="mt-5 space-y-4">
          {inventory.data.map((item) => (
            <InventoryCard
              key={`${item.warehouseId}:${item.variantId}`}
              item={item}
              onSaved={() => void inventory.refetch()}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">Tanımlı depo stoğu bulunamadı.</p>
      )}
    </section>
  );
}

function InventoryCard({ item, onSaved }: { item: AdminInventoryItem; onSaved: () => void }) {
  const adjustInventory = useServerFn(adjustCommerceInventory);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const quantityDelta = Number(delta);
    if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
      toast.error("Miktar sıfırdan farklı bir tam sayı olmalıdır.");
      return;
    }
    if (reason.trim().length < 3) {
      toast.error("Stok değişikliği için bir neden yazın.");
      return;
    }

    setBusy(true);
    try {
      await adjustInventory({
        data: {
          warehouseId: item.warehouseId,
          variantId: item.variantId,
          quantityDelta,
          reason: reason.trim(),
          idempotencyKey: crypto.randomUUID(),
        },
      });
      toast.success("Stok güncellendi ve işlem kaydedildi.");
      setDelta("");
      setReason("");
      onSaved();
    } catch {
      toast.error("Stok güncellenemedi. Ayrılmış miktarın altına düşülemez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-border/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-sm text-primary-deep">{item.productName}</strong>
          <span className="mt-1 block text-xs text-muted-foreground">
            {item.sku} · {item.warehouseName} ({item.warehouseCode})
          </span>
        </div>
        <div className="flex gap-2 text-center text-xs">
          <StockPill label="Fiziksel" value={item.onHand} />
          <StockPill label="Ayrılmış" value={item.reserved} />
          <StockPill label="Satılabilir" value={item.available} emphasized />
        </div>
      </div>
      <form className="mt-4 grid gap-3 sm:grid-cols-[9rem_1fr_auto]" onSubmit={onSubmit}>
        <div className="space-y-1">
          <Label htmlFor={`delta-${item.variantId}`}>Değişim (+/−)</Label>
          <Input
            id={`delta-${item.variantId}`}
            type="number"
            step="1"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            placeholder="Örn. 50 veya -3"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`reason-${item.variantId}`}>İşlem nedeni</Label>
          <Input
            id={`reason-${item.variantId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Mal kabul, sayım düzeltmesi, hasar…"
            maxLength={500}
          />
        </div>
        <Button type="submit" className="self-end rounded-full" disabled={busy}>
          {busy ? "Kaydediliyor…" : "Stoğu güncelle"}
        </Button>
      </form>
    </article>
  );
}

function StockPill({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <span className={`rounded-xl px-3 py-2 ${emphasized ? "bg-primary/10" : "bg-secondary"}`}>
      <strong className="block text-base text-primary-deep">{value}</strong>
      {label}
    </span>
  );
}
