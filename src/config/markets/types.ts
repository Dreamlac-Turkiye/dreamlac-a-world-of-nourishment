export const MARKET_CODES = ["TR", "SA"] as const;
export type MarketCode = (typeof MARKET_CODES)[number];
export type CommerceProviderKind = "payment" | "shipping" | "invoicing" | "email" | "sms";

export interface ProviderSelection {
  provider: string | null;
  enabled: boolean;
}

export interface MarketProfile {
  code: MarketCode;
  enabled: boolean;
  domains: readonly string[];
  defaultLocale: string;
  supportedLocales: readonly string[];
  currency: "TRY" | "SAR";
  timezone: string;
  countryCallingCode: string;
  addressSchema: MarketCode;
  taxMode: "tax_inclusive" | "tax_exclusive";
  providers: Record<CommerceProviderKind, ProviderSelection>;
  features: {
    checkout: boolean;
    guestCheckout: boolean;
    payments: boolean;
    shipping: boolean;
    invoicing: boolean;
  };
}
