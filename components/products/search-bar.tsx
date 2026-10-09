"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/shop?q=${encodeURIComponent(trimmed)}`);
    onNavigate?.();
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)} role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sarees, fabrics, colors..."
        aria-label="Search products"
        className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-4 text-sm placeholder:text-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2"
      />
    </form>
  );
}
