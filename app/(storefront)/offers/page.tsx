import type { Metadata } from "next";
import { CollectionPage } from "@/components/shop/collection-page";

export const metadata: Metadata = {
  title: "Offers",
  description: "Sarees on offer at Renish Collections.",
  alternates: { canonical: "/offers" },
};

export default async function OffersPage({ searchParams }: PageProps<"/offers">) {
  const sp = await searchParams;
  return (
    <CollectionPage
      collection="offers"
      title="Offers"
      description="Sarees currently available at a special price."
      basePath="/offers"
      emptyTitle="No offers running right now"
      emptyText="New offers will be listed here as soon as they start."
      sortParam={typeof sp.sort === "string" ? sp.sort : undefined}
      pageParam={typeof sp.page === "string" ? sp.page : undefined}
    />
  );
}
