import { getProducts } from "@/services/catalog";
import type {
  CartItem,
  CartLine,
  CartTotals,
  CheckoutAddress,
  OrderResult,
  PaymentMethodOption,
  ShippingOption,
} from "@/types";

/**
 * Sipariş ve kargo servis katmanı (mock).
 * Backend hazır olduğunda yalnızca bu dosyanın gövdesi değiştirilir.
 * Kargo ücreti, KDV oranı ve teslimat süresi resmî bilgi gelmeden doldurulmaz.
 */

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    title: "Standart Kargo",
    description:
      "Kargo firması ve teslimat süresi bilgisi tarafımıza iletildikten sonra eklenecek.",
    fee: null,
  },
  {
    id: "pickup",
    title: "Mağazadan / Tesisten Teslim",
    description: "Teslim noktası ve çalışma saatleri bilgisi onaylandıktan sonra eklenecek.",
    fee: null,
  },
];

const paymentMethods: PaymentMethodOption[] = [
  {
    id: "card",
    title: "Kredi / Banka Kartı",
    description: "Ödeme altyapısı bağlanana kadar bu alan yalnızca arayüz önizlemesidir.",
    available: true,
  },
  {
    id: "transfer",
    title: "Havale / EFT",
    description: "Banka hesap bilgileri tarafımıza iletildikten sonra eklenecek.",
    available: false,
  },
];

export function getShippingOptions(): ShippingOption[] {
  return shippingOptions;
}

export function getPaymentMethods(): PaymentMethodOption[] {
  return paymentMethods;
}

/** Sepet satırlarını ürün verisiyle birleştirir. */
export async function resolveCartItems(lines: CartLine[]): Promise<CartItem[]> {
  const products = await getProducts();
  return lines.flatMap((line) => {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return [];
    const lineTotal = product.price.amount === null ? null : product.price.amount * line.quantity;
    return [{ product, quantity: line.quantity, lineTotal }];
  });
}

export function calculateTotals(items: CartItem[], shipping: number | null): CartTotals {
  const hasPendingPrice = items.some((item) => item.lineTotal === null);
  const subtotal = hasPendingPrice
    ? null
    : items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  const total = subtotal === null || shipping === null ? null : subtotal + shipping;
  return {
    subtotal,
    shipping,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    hasPendingPrice,
  };
}

/** Kuruş → görüntülenecek TRY metni. */
export function formatTry(amount: number | null): string | null {
  if (amount === null) return null;
  return `${(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;
}

/**
 * Sipariş oluşturma (mock). Gerçek tahsilat veya kayıt yapılmaz;
 * yalnızca akışın son adımını göstermek için önizleme numarası üretir.
 */
export async function createOrder(input: {
  items: CartItem[];
  address: CheckoutAddress;
  shippingOptionId: string;
  paymentMethodId: string;
}): Promise<OrderResult> {
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    orderNumber: `DL-${new Date().getFullYear()}-${suffix}`,
    createdAt: new Date().toISOString(),
    itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
    status: "preview",
  };
}
