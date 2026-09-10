import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { CartLine } from "@/types";

export const MAX_QUANTITY_PER_LINE = 10;
const STORAGE_KEY = "dreamlac.cart.v1";

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; productId: string; quantity: number }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

interface State {
  lines: CartLine[];
  hydrated: boolean;
}

const clamp = (n: number) => Math.min(MAX_QUANTITY_PER_LINE, Math.max(1, Math.trunc(n) || 1));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, hydrated: true };
    case "add": {
      const existing = state.lines.find((l) => l.productId === action.productId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.productId === action.productId
              ? { ...l, quantity: clamp(l.quantity + action.quantity) }
              : l,
          ),
        };
      }
      return {
        ...state,
        lines: [...state.lines, { productId: action.productId, quantity: clamp(action.quantity) }],
      };
    }
    case "setQuantity":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.productId === action.productId ? { ...l, quantity: clamp(action.quantity) } : l,
        ),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
    case "clear":
      return { ...state, lines: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is CartLine =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as CartLine).productId === "string" &&
          typeof (item as CartLine).quantity === "number",
      )
      .map((item) => ({ productId: item.productId, quantity: clamp(item.quantity) }));
  } catch {
    return [];
  }
}

/**
 * Sepet durumu — yalnızca ürün kodu ve adet tutulur (veritabanı yerine kullanılmaz).
 * Fiyat, stok ve ürün bilgisi her zaman servis katmanından okunur.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });

  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStorage() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      /* depolama kullanılamıyorsa sessiz geç */
    }
  }, [state.lines, state.hydrated]);

  const add = useCallback((productId: string, quantity = 1) => {
    dispatch({ type: "add", productId, quantity });
  }, []);
  const setQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "setQuantity", productId, quantity });
  }, []);
  const remove = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      hydrated: state.hydrated,
      itemCount: state.lines.reduce((sum, l) => sum + l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [state.lines, state.hydrated, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalıdır.");
  return ctx;
}
