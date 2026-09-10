"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function MobileFilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-sm border border-border px-3 text-sm font-medium"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-charcoal/40"
            onClick={() => setOpen(false)}
          />
          <div className="h-full w-80 max-w-[85vw] overflow-y-auto bg-ivory p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
