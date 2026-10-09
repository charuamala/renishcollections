"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface VariantSelection {
  /** The variant the shopper is looking at — set by the colour picker or by clicking a gallery photo. */
  variantId: string | null;
  setVariantId: (id: string | null) => void;
}

const VariantSelectionContext = createContext<VariantSelection | null>(null);

/** Shares the chosen variant between the image gallery and the variant selector on a product page. */
export function VariantSelectionProvider({ children }: { children: ReactNode }) {
  const [variantId, setVariantId] = useState<string | null>(null);
  return <VariantSelectionContext.Provider value={{ variantId, setVariantId }}>{children}</VariantSelectionContext.Provider>;
}

/** Null outside a provider, so the gallery and selector still work on their own. */
export function useVariantSelection() {
  return useContext(VariantSelectionContext);
}
