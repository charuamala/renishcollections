import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCategoryBySlug } from "@/services/category.service";
import { getWishlistProductIdsForUser } from "@/services/wishlist.service";
import { CategoryListing } from "@/components/shop/category-listing";
import { breadcrumbJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[categorySlug]">): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return {};

  const title = category.seoTitle || `${category.name} — Shop Online`;
  const description = category.seoDescription || category.description || undefined;

  return {
    title,
    description,
    alternates: { canonical: category.canonicalUrl || `/${category.slug}` },
    openGraph: { title, description, images: category.imageUrl ? [category.imageUrl] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[categorySlug]">) {
  const { categorySlug } = await params;
  const sp = await searchParams;

  const [category, session] = await Promise.all([getCategoryBySlug(categorySlug), auth()]);
  if (!category) notFound();

  const wishlistedIds = session?.user?.id ? await getWishlistProductIdsForUser(session.user.id) : [];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: category.name, url: `/${category.slug}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <CategoryListing
        categorySlug={category.slug}
        title={category.name}
        description={category.description}
        subcategories={category.children.map((c) => ({ name: c.name, slug: c.slug, imageUrl: c.imageUrl }))}
        basePath={`/${category.slug}`}
        sortParam={typeof sp.sort === "string" ? sp.sort : undefined}
        pageParam={typeof sp.page === "string" ? sp.page : undefined}
        wishlistedIds={wishlistedIds}
      />
    </>
  );
}
