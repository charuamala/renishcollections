import type { Banner } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/hero-slider";

/** Home hero: the admin-managed banner slider, followed by the page headline and main actions. */
export function HeroBanner({ banners }: { banners: Banner[] }) {
  return (
    <>
      <HeroSlider
        slides={banners.map((b) => ({
          id: b.id,
          title: b.title,
          imageUrl: b.imageUrl,
          mobileImageUrl: b.mobileImageUrl,
          linkUrl: b.linkUrl,
        }))}
      />

      <section
        className={
          banners.length > 0
            ? "mx-auto max-w-3xl px-4 pb-4 pt-8 text-center sm:px-6 sm:pt-10"
            : "bg-gradient-to-br from-maroon-900 via-maroon-700 to-maroon-600 px-4 py-20 text-center sm:py-28"
        }
      >
        <h1
          className={`font-display text-3xl font-semibold sm:text-4xl lg:text-5xl ${banners.length > 0 ? "text-charcoal" : "text-white"}`}
        >
          Elegance Woven for Every Occasion
        </h1>
        <p className={`mt-3 text-base sm:text-lg ${banners.length > 0 ? "text-ink-600" : "text-white/85"}`}>
          Discover timeless sarees crafted in exquisite fabrics.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/sarees" variant={banners.length > 0 ? "primary" : "gold"} size="lg">
            Shop Sarees
          </Button>
          <Button
            href="/new-arrivals"
            variant="secondary"
            size="lg"
            className={banners.length > 0 ? "" : "border-white text-white hover:bg-white/10"}
          >
            New Arrivals
          </Button>
        </div>
      </section>
    </>
  );
}
