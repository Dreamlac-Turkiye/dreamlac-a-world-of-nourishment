import type { MarketCode } from "@/config/markets";
import { getProviderName, getRuntimeConfig } from "@/config/runtime.server";
import { IntegrationDisabledError } from "./contracts";
import type { InvoiceProvider, PaymentProvider, ShippingProvider } from "./contracts";

type ProviderMap<T> = Readonly<Record<string, T>>;
const paymentProviders: ProviderMap<PaymentProvider> = {};
const shippingProviders: ProviderMap<ShippingProvider> = {};
const invoiceProviders: ProviderMap<InvoiceProvider> = {};

function resolveProvider<T>(
  market: MarketCode,
  kind: "payment" | "shipping" | "invoice",
  providers: ProviderMap<T>,
): T {
  const name = getProviderName(getRuntimeConfig(), market, kind);
  const provider = providers[name];
  if (name === "disabled" || !provider) throw new IntegrationDisabledError(kind, market);
  return provider;
}

export const commerceProviders = {
  payment: (market: MarketCode) => resolveProvider(market, "payment", paymentProviders),
  shipping: (market: MarketCode) => resolveProvider(market, "shipping", shippingProviders),
  invoice: (market: MarketCode) => resolveProvider(market, "invoice", invoiceProviders),
};
