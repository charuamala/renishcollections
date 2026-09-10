export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="font-display text-center text-2xl font-semibold text-charcoal">{title}</h1>
      {subtitle && <p className="mt-1 text-center text-sm text-ink-600">{subtitle}</p>}
      <div className="mt-8 rounded-sm border border-border bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
