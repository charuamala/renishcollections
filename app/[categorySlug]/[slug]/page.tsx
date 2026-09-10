import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCategoryBySlug } from "@/services/category.service";
import {
  getProductBySlug,
  getRelatedProducts,
  findRedirectTarget,
} from "@/services/product.service";
import { getApprovedReviewsForProduct, getProductRatingSummary } from "@/services/review.service";
import { getWishlistProductIdsForUser } from "@/services/wishlist.service";
import { CategoryListing } from "@/components/shop/category-listing";
import { ProductDetail } from "@/components/products/product-detail";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { productHref } from "@/lib/product-url";

async function resolveSubcategory(categorySlug: string, slug: string) {
  const subcategory = await getCategoryBySlug(slug);
  if (subcategory?.parent?.slug === categorySlug) return subcategory;
  return null;
}

export async function generateMetadata({ params }: PageProps<"/[categorySlug]/[slug]">): Promise<Metadata> {
  const { categorySlug, slug } = await params;

  const subcategory = await resolveSubcategory(categorySlug, slug);
  if (subcategory) {
    return {
      title: subcategory.seoTitle || subcategory.name,
      description: subcategory.seoDescription || subcategory.description || undefined,
      alternates: { canonical: subcategory.canonicalUrl || `/${categorySlug}/${slug}` },
    };
  }

  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.shortDescription || undefined;
  const images = product.ogImageUrl ? [product.ogImageUrl] : product.images.map((i) => i.url);

  return {
    title,
    description,
    keywords: product.seoKeywords || undefined,
    alternates: { canonical: product.canonicalUrl || productHref(product) },
    openGraph: { title, description, images, type: "website" },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function CategoryOrProductPage({ params }: PageProps<"/[categorySlug]/[slug]">) {
  const { categorySlug, slug } = await params;
  const session = await auth();

  const subcategory = await resolveSubcategory(categorySlug, slug);
  if (subcategory) {
    const wishlistedIds = session?.user?.id ? await getWishlistProductIdsForUser(session.user.id) : [];
    const breadcrumb = breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: subcategory.parent!.slug, url: `/${categorySlug}` },
      { name: subcategory.name, url: `/${categorySlug}/${slug}` },
    ]);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <CategoryListing
          categorySlug={subcategory.slug}
          title={subcategory.name}
          description={subcategory.description}
          subcategories={[]}
          basePath={`/${categorySlug}/${slug}`}
          wishlistedIds={wishlistedIds}
        />
      </>
    );
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    const redirectTarget = await findRedirectTarget(slug);
    if (redirectTarget) {
      const targetProduct = await getProductBySlug(redirectTarget);
      if (targetProduct) redirect(productHref(targetProduct));
    }
    notFound();
  }

  const canonicalHref = productHref(product);
  if (`/${categorySlug}/${slug}` !== canonicalHref) {
    redirect(canonicalHref);
  }

  const [relatedProducts, reviews, ratingSummary, wishlistedIds] = await Promise.all([
    getRelatedProducts(product.id, product.category.id),
    getApprovedReviewsForProduct(product.id),
    getProductRatingSummary(product.id),
    session?.user?.id ? getWishlistProductIdsForUser(session.user.id) : Promise.resolve([]),
  ]);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: product.category.name, url: `/${categorySlug}` },
    { name: product.name, url: canonicalHref },
  ]);

  const productSchema = productJsonLd({
    name: product.name,
    description: product.description,
    sku: product.sku,
    images: product.images,
    sellingPrice: product.sellingPrice.toString(),
    stock: product.stock,
    href: canonicalHref,
    category: product.category,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        reviews={reviews}
        ratingSummary={ratingSummary}
        isLoggedIn={!!session?.user}
        isWishlisted={wishlistedIds.includes(product.id)}
      />
    </>
  );
}
