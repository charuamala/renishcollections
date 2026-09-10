export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "error" | "success";
}) {
  const toneClasses = {
    default: "text-charcoal",
    warning: "text-gold-600",
    error: "text-error",
    success: "text-success",
  } as const;

  return (
    <div className="rounded-sm border border-border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}
