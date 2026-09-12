import type { MarketProfile } from "./types";

/** Commerce switches stay off until official data and provider certification are complete. */
export const turkeyMarket: MarketProfile = {
  code: "TR",
  enabled: true,
  domains: ["dreamlac.com.tr", "www.dreamlac.com.tr", "localhost"],
  defaultLocale: "tr-TR",
  supportedLocales: ["tr-TR"],
  currency: "TRY",
  timezone: "Europe/Istanbul",
  countryCallingCode: "+90",
  addressSchema: "TR",
  taxMode: "tax_inclusive",
  providers: {
    payment: { provider: null, enabled: false },
    shipping: { provider: null, enabled: false },
    invoicing: { provider: null, enabled: false },
    email: { provider: null, enabled: false },
    sms: { provider: null, enabled: false },
  },
  features: {
    checkout: false,
    guestCheckout: true,
    payments: false,
    shipping: false,
    invoicing: false,
  },
};
