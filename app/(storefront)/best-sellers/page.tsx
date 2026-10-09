import type { Metadata } from "next";
import { CollectionPage } from "@/components/shop/collection-page";

export const metadata: Metadata = {
  title: "Best Sellers",
  description: "The sarees our customers love most at Renish Collections.",
  alternates: { canonical: "/best-sellers" },
};

export default async function BestSellersPage({ searchParams }: PageProps<"/best-sellers">) {
  const sp = await searchParams;
  return (
    <CollectionPage
      collection="best-sellers"
      title="Best Sellers"
      description="The sarees our customers love most."
      basePath="/best-sellers"
      defaultSort="best_selling"
      emptyTitle="Our best sellers will appear here soon"
      emptyText="As customers find their favourites, the most-loved sarees will be collected here."
      sortParam={typeof sp.sort === "string" ? sp.sort : undefined}
      pageParam={typeof sp.page === "string" ? sp.page : undefined}
    />
  );
}
