import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  gold: "bg-gold-500 text-charcoal",
  maroon: "bg-maroon-600 text-ivory",
  outline: "border border-border text-ink-600",
  success: "bg-success text-white",
  error: "bg-error text-white",
} as const;

export function Badge({
  children,
  variant = "maroon",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
