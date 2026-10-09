import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import compactMaroon from "@/public/brand/logo-compact-maroon.png";
import compactGold from "@/public/brand/logo-compact-gold.png";
import compactIvory from "@/public/brand/logo-compact-ivory.png";
import stackedMaroon from "@/public/brand/logo-stacked-maroon.png";
import stackedGold from "@/public/brand/logo-stacked-gold.png";
import markMaroon from "@/public/brand/logo-mark-maroon.png";
import markGold from "@/public/brand/logo-mark-gold.png";

// Maroon on light grounds (ivory/cream/white), gold or ivory on dark grounds (maroon/charcoal).
const SOURCES = {
  compact: { maroon: compactMaroon, gold: compactGold, ivory: compactIvory },
  stacked: { maroon: stackedMaroon, gold: stackedGold, ivory: stackedGold },
  mark: { maroon: markMaroon, gold: markGold, ivory: markGold },
} as const;

/**
 * Brand logo. Size it with a height class (e.g. `h-10`); width follows the
 * artwork's aspect ratio.
 */
export function Logo({
  variant = "compact",
  tone = "maroon",
  className,
  eager,
  alt = SITE_NAME,
}: {
  variant?: keyof typeof SOURCES;
  tone?: "maroon" | "gold" | "ivory";
  className?: string;
  /** Load immediately (above-the-fold placements such as the header). */
  eager?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={SOURCES[variant][tone]}
      alt={alt}
      loading={eager ? "eager" : undefined}
      className={cn("h-10 w-auto select-none", className)}
      draggable={false}
    />
  );
}
