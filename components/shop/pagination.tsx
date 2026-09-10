import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(p: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={hrefForPage(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-sm border border-border px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-cream"}`}
      >
        Previous
      </Link>
      <span className="text-sm text-ink-600">
        Page {page} of {totalPages}
      </span>
      <Link
        href={hrefForPage(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-sm border border-border px-3 py-1.5 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-cream"}`}
      >
        Next
      </Link>
    </nav>
  );
}
