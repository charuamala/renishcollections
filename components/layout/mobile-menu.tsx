"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileMenu({ navLinks }: { navLinks: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center"
      >
        <Menu className="h-6 w-6" strokeWidth={1.75} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-charcoal/40"
            onClick={() => setOpen(false)}
          />
          <nav className="flex h-full w-72 flex-col gap-1 bg-ivory p-6 shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="mb-4 ml-auto flex h-9 w-9 items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-2.5 text-sm font-medium text-charcoal hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
