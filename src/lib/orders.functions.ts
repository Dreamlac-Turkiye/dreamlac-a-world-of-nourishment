import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sipariş kayıtları. Yalnızca giriş yapmış kullanıcı kendi siparişini oluşturur ve okur
 * (veritabanı kuralları ile sınırlandırılmıştır). Gerçek tahsilat yapılmaz;
 * kayıt durumu "preview" olarak saklanır.
 */

export interface OrderItemRecord {
  productId: string;
  productSlug: string;
  productName: string;
  stage: string | null;
  quantity: number;
  unitPriceKurus: number | null;
  lineTotalKurus: number | null;
}

export interface OrderRecord {
  orderNumber: string;
  status: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  note: string | null;
  shippingOptionTitle: string;
  paymentMethodTitle: string;
  subtotalKurus: number | null;
  shippingKurus: number | null;
  totalKurus: number | null;
  itemCount: number;
  items: OrderItemRecord[];
}

interface PlaceOrderInput {
  address: {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    addressLine: string;
    note: string;
  };
  shipping: { id: string; title: string; fee: number | null };
  payment: { id: string; title: string };
  subtotalKurus: number | null;
  totalKurus: number | null;
  items: OrderItemRecord[];
}

function generateOrderNumber(): string {
  const suffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `DL-${new Date().getFullYear()}-${suffix}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlaceOrderInput) => input)
  .handler(async ({ data, context }): Promise<{ orderNumber: string }> => {
    const { supabase, userId } = context;
    const orderNumber = generateOrderNumber();
    const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: "preview",
        full_name: data.address.fullName,
        phone: data.address.phone,
        email: data.address.email,
        city: data.address.city,
        district: data.address.district,
        address_line: data.address.addressLine,
        note: data.address.note || null,
        shipping_option_id: data.shipping.id,
        shipping_option_title: data.shipping.title,
        payment_method_id: data.payment.id,
        payment_method_title: data.payment.title,
        subtotal_kurus: data.subtotalKurus,
        shipping_kurus: data.shipping.fee,
        total_kurus: data.totalKurus,
        item_count: itemCount,
      })
      .select("id, order_number")
      .single();

    if (error || !order) throw new Error(error?.message ?? "Sipariş kaydedilemedi.");

    if (data.items.length > 0) {
      const { error: itemsError } = await supabase.from("order_items").insert(
        data.items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_slug: item.productSlug,
          product_name: item.productName,
          stage: item.stage,
          quantity: item.quantity,
          unit_price_kurus: item.unitPriceKurus,
          line_total_kurus: item.lineTotalKurus,
        })),
      );
      if (itemsError) throw new Error(itemsError.message);
    }

    return { orderNumber: order.order_number };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OrderRecord[]> => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "order_number, status, created_at, full_name, phone, email, city, district, address_line, note, shipping_option_title, payment_method_title, subtotal_kurus, shipping_kurus, total_kurus, item_count",
      )
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      orderNumber: row.order_number,
      status: row.status,
      createdAt: row.created_at,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      city: row.city,
      district: row.district,
      addressLine: row.address_line,
      note: row.note,
      shippingOptionTitle: row.shipping_option_title,
      paymentMethodTitle: row.payment_method_title,
      subtotalKurus: row.subtotal_kurus,
      shippingKurus: row.shipping_kurus,
      totalKurus: row.total_kurus,
      itemCount: row.item_count,
      items: [],
    }));
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { orderNumber: string }) => input)
  .handler(async ({ data, context }): Promise<OrderRecord | null> => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, status, created_at, full_name, phone, email, city, district, address_line, note, shipping_option_title, payment_method_title, subtotal_kurus, shipping_kurus, total_kurus, item_count",
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();

    if (error || !row) return null;

    const { data: itemRows } = await context.supabase
      .from("order_items")
      .select(
        "product_id, product_slug, product_name, stage, quantity, unit_price_kurus, line_total_kurus",
      )
      .eq("order_id", row.id);

    return {
      orderNumber: row.order_number,
      status: row.status,
      createdAt: row.created_at,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      city: row.city,
      district: row.district,
      addressLine: row.address_line,
      note: row.note,
      shippingOptionTitle: row.shipping_option_title,
      paymentMethodTitle: row.payment_method_title,
      subtotalKurus: row.subtotal_kurus,
      shippingKurus: row.shipping_kurus,
      totalKurus: row.total_kurus,
      itemCount: row.item_count,
      items: (itemRows ?? []).map((item) => ({
        productId: item.product_id,
        productSlug: item.product_slug,
        productName: item.product_name,
        stage: item.stage,
        quantity: item.quantity,
        unitPriceKurus: item.unit_price_kurus,
        lineTotalKurus: item.line_total_kurus,
      })),
    };
  });
