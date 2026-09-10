import { auth } from "@/auth";
import { getFeaturedProducts, getNewArrivals, getBestSellers } from "@/services/product.service";
import { getNavCategories } from "@/services/category.service";
import { getActiveBanners } from "@/services/banner.service";
import { getFeaturedReviews } from "@/services/review.service";
import { getSiteSettings } from "@/services/settings.service";
import { getWishlistProductIdsForUser } from "@/services/wishlist.service";
import { HeroBanner } from "@/components/home/hero-banner";
import { ProductSection } from "@/components/home/product-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { WhyShopWithUs } from "@/components/home/why-shop-with-us";
import { InstagramSection } from "@/components/home/instagram-section";
import { ReviewsSection } from "@/components/home/reviews-section";

export default async function HomePage() {
  const session = await auth();

  const [heroBanners, categories, newArrivals, bestSellers, featured, reviews, settings, wishlistedIds] =
    await Promise.all([
      getActiveBanners("HOME_HERO"),
      getNavCategories(),
      getNewArrivals(8),
      getBestSellers(8),
      getFeaturedProducts(8),
      getFeaturedReviews(6),
      getSiteSettings(),
      session?.user?.id ? getWishlistProductIdsForUser(session.user.id) : Promise.resolve([]),
    ]);

  return (
    <>
      <HeroBanner banner={heroBanners[0] ?? null} />

      <CategoryGrid categories={categories} />

      <ProductSection
        title="New Arrivals"
        subtitle="Fresh off the loom this week"
        products={newArrivals}
        viewAllHref="/new-arrivals"
        wishlistedIds={wishlistedIds}
      />

      <ProductSection
        title="Best Sellers"
        subtitle="Loved by our customers"
        products={bestSellers}
        viewAllHref="/best-sellers"
        wishlistedIds={wishlistedIds}
      />

      <ProductSection
        title="Featured Collection"
        subtitle="Handpicked for the season"
        products={featured}
        viewAllHref="/shop"
        wishlistedIds={wishlistedIds}
      />

      <WhyShopWithUs />

      <ReviewsSection reviews={reviews} />

      <InstagramSection instagramUrl={settings.instagramUrl ?? ""} />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-charcoal">Online Saree Shopping, Simplified</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Renish Collections brings you silk sarees, cotton sarees, designer sarees and wedding sarees curated for
          the modern Indian woman. Explore traditional weaves alongside contemporary prints, all shipped from our
          collection to your doorstep with care.
        </p>
      </section>
    </>
  );
}
