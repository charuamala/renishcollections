import { redirect } from "next/navigation";

/** The header search and the site's search metadata point here; results live on the shop page. */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  redirect(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
}
