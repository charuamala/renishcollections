import type { Metadata } from "next";
import { CollectionPage } from "@/components/shop/collection-page";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The latest sarees at Renish Collections — freshly added Banarasi, tissue and silk sarees.",
  alternates: { canonical: "/new-arrivals" },
};

export default async function NewArrivalsPage({ searchParams }: PageProps<"/new-arrivals">) {
  const sp = await searchParams;
  return (
    <CollectionPage
      collection="new-arrivals"
      title="New Arrivals"
      description="The latest sarees to arrive at Renish Collections."
      basePath="/new-arrivals"
      emptyTitle="New sarees are on their way"
      emptyText="We're adding our newest pieces right now. Please check back soon."
      sortParam={typeof sp.sort === "string" ? sp.sort : undefined}
      pageParam={typeof sp.page === "string" ? sp.page : undefined}
    />
  );
}
