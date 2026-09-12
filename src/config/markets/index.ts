import { saudiArabiaMarket } from "./sa";
import { turkeyMarket } from "./tr";
import type { MarketCode, MarketProfile } from "./types";

export const marketProfiles: Readonly<Record<MarketCode, MarketProfile>> = {
  TR: turkeyMarket,
  SA: saudiArabiaMarket,
};

export function getMarketProfile(code: MarketCode): MarketProfile {
  return marketProfiles[code];
}

export function resolveMarketByHost(host: string): MarketProfile | null {
  const normalizedHost = host.trim().toLowerCase().split(":")[0] ?? "";
  return (
    Object.values(marketProfiles).find(
      (market) => market.enabled && market.domains.includes(normalizedHost),
    ) ?? null
  );
}

export type { MarketCode, MarketProfile } from "./types";
