import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { resolveCartItems } from "@/services/checkout";
import type { CartItem } from "@/types";

/** Sepet satırlarını ürün verisiyle çözümler. */
export function useCartItems(): { items: CartItem[]; isLoading: boolean } {
  const { lines, hydrated } = useCart();
  const key = lines.map((l) => `${l.productId}:${l.quantity}`).join(",");

  const query = useQuery({
    queryKey: ["cart-items", key],
    queryFn: () => resolveCartItems(lines),
    enabled: hydrated,
  });

  return { items: query.data ?? [], isLoading: !hydrated || query.isLoading };
}
