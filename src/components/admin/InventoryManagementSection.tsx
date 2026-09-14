import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Boxes, History, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listCommerceInventory,
  listInventoryMovements,
  recordInventoryOperation,
  type AdminInventoryItem,
} from "@/lib/admin-commerce.functions";

export function InventoryManagementSection() {
  const readInventory = useServerFn(listCommerceInventory);
  const inventory = useQuery({
    queryKey: ["admin", "inventory", "TR"],
    queryFn: () => readInventory({ data: { market: "TR" } }),
  });
  const readMovements = useServerFn(listInventoryMovements);
  const [movementQuery, setMovementQuery] = useState("");
  const [submittedMovementQuery, setSubmittedMovementQuery] = useState("");
  const movements = useQuery({
    queryKey: ["admin", "inventory-movements", submittedMovementQuery],
    queryFn: () => readMovements({ data: { query: submittedMovementQuery } }),
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
          {inventory.data ? (
            <p className="mt-2 text-xs font-medium text-amber-700">
              {inventory.data.filter((item) => item.lowStock).length} ürün yeniden sipariş
              sınırında.
            </p>
          ) : null}
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
              onSaved={() => {
                void inventory.refetch();
                void movements.refetch();
              }}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">Tanımlı depo stoğu bulunamadı.</p>
      )}

      <div className="mt-8 border-t border-border/60 pt-6">
        <div className="flex items-center gap-2">
          <History size={18} className="text-primary" />
          <h3 className="font-semibold text-primary-deep">Stok hareketleri</h3>
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedMovementQuery(movementQuery.trim());
          }}
        >
          <Input
            value={movementQuery}
            onChange={(event) => setMovementQuery(event.target.value)}
            placeholder="Ürün, SKU veya işlem nedeni ara"
            maxLength={200}
          />
          <Button type="submit" variant="outline" className="rounded-full">
            <Search size={14} className="mr-2" /> Ara
          </Button>
        </form>
        {movements.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Hareketler yükleniyor…</p>
        ) : movements.isError ? (
          <p className="mt-4 text-sm text-destructive">Stok hareketleri alınamadı.</p>
        ) : movements.data?.length ? (
          <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 px-4">
            {movements.data.map((movement) => (
              <div key={movement.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto]">
                <div>
                  <strong className="text-primary-deep">{movement.productName}</strong>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {movement.sku} · {movement.reason}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  <strong
                    className={movement.quantityDelta > 0 ? "text-emerald-700" : "text-destructive"}
                  >
                    {movement.quantityDelta > 0 ? "+" : ""}
                    {movement.quantityDelta}
                  </strong>{" "}
                  · {new Date(movement.createdAt).toLocaleString("tr-TR")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Kayıtlı stok hareketi bulunmuyor.</p>
        )}
      </div>
    </section>
  );
}

function InventoryCard({ item, onSaved }: { item: AdminInventoryItem; onSaved: () => void }) {
  const recordOperation = useServerFn(recordInventoryOperation);
  const [quantity, setQuantity] = useState("");
  const [operationType, setOperationType] = useState<
    "receipt" | "adjustment" | "count" | "return" | "damage"
  >("receipt");
  const [reorderPoint, setReorderPoint] = useState(String(item.reorderPoint));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const quantityValue = Number(quantity);
    const reorderPointValue = Number(reorderPoint);
    if (!Number.isInteger(quantityValue) || (operationType !== "count" && quantityValue === 0)) {
      toast.error("Geçerli bir tam sayı miktarı girin.");
      return;
    }
    if (!Number.isInteger(reorderPointValue) || reorderPointValue < 0) {
      toast.error("Yeniden sipariş sınırı sıfır veya daha büyük olmalıdır.");
      return;
    }
    if (reason.trim().length < 3) {
      toast.error("Stok değişikliği için bir neden yazın.");
      return;
    }

    setBusy(true);
    try {
      await recordOperation({
        data: {
          warehouseId: item.warehouseId,
          variantId: item.variantId,
          operationType,
          quantity: quantityValue,
          reason: reason.trim(),
          reorderPoint: reorderPointValue,
          idempotencyKey: crypto.randomUUID(),
        },
      });
      toast.success("Stok güncellendi ve işlem kaydedildi.");
      setQuantity("");
      setReason("");
      onSaved();
    } catch {
      toast.error("Stok güncellenemedi. Ayrılmış miktarın altına düşülemez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={`rounded-2xl border p-4 ${item.lowStock ? "border-amber-300 bg-amber-50/40" : "border-border/60"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-sm text-primary-deep">{item.productName}</strong>
          <span className="mt-1 block text-xs text-muted-foreground">
            {item.sku} · {item.warehouseName} ({item.warehouseCode})
          </span>
          {item.lowStock ? (
            <span className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-700">
              <AlertTriangle size={13} /> Yeniden sipariş gerekli
            </span>
          ) : null}
        </div>
        <div className="flex gap-2 text-center text-xs">
          <StockPill label="Fiziksel" value={item.onHand} />
          <StockPill label="Ayrılmış" value={item.reserved} />
          <StockPill label="Satılabilir" value={item.available} emphasized />
        </div>
      </div>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[10rem_8rem_8rem_1fr_auto]"
        onSubmit={onSubmit}
      >
        <div className="space-y-1">
          <Label htmlFor={`type-${item.variantId}`}>İşlem</Label>
          <select
            id={`type-${item.variantId}`}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={operationType}
            onChange={(event) => setOperationType(event.target.value as typeof operationType)}
          >
            <option value="receipt">Mal kabul</option>
            <option value="return">Müşteri iadesi</option>
            <option value="damage">Hasar / fire</option>
            <option value="count">Fiziksel sayım</option>
            <option value="adjustment">Düzeltme</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`delta-${item.variantId}`}>
            {operationType === "count" ? "Sayım sonucu" : "Miktar"}
          </Label>
          <Input
            id={`delta-${item.variantId}`}
            type="number"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder={operationType === "count" ? "Fiziksel adet" : "Örn. 50"}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`reorder-${item.variantId}`}>Alt stok sınırı</Label>
          <Input
            id={`reorder-${item.variantId}`}
            type="number"
            min="0"
            step="1"
            value={reorderPoint}
            onChange={(event) => setReorderPoint(event.target.value)}
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
