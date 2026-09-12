import type { MarketProfile } from "./types";

/** Template only; enable after Saudi legal, tax and provider review. */
export const saudiArabiaMarket: MarketProfile = {
  code: "SA",
  enabled: false,
  domains: ["dreamlac.com.sa", "www.dreamlac.com.sa"],
  defaultLocale: "ar-SA",
  supportedLocales: ["ar-SA", "en-SA"],
  currency: "SAR",
  timezone: "Asia/Riyadh",
  countryCallingCode: "+966",
  addressSchema: "SA",
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
    guestCheckout: false,
    payments: false,
    shipping: false,
    invoicing: false,
  },
};
