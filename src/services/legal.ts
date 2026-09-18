import { isDemoMode } from "@/config/env";
import { getLegalDocument as readDocument } from "@/lib/legal.functions";

// Keep client navigation local in preview as well as the initial SSR request.
export const getLegalDocument = (options: Parameters<typeof readDocument>[0]) =>
  isDemoMode ? Promise.resolve(null) : readDocument(options);
