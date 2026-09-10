import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Banner } from "@prisma/client";

export function HeroBanner({ banner }: { banner: Banner | null }) {
  if (banner) {
    return (
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-maroon-900 sm:h-[70vh]">
        <Image src={banner.imageUrl} alt={banner.title} fill priority className="object-cover opacity-90" />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-charcoal/60 via-charcoal/20 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display max-w-xl text-4xl font-semibold text-white sm:text-5xl">{banner.title}</h1>
            {banner.linkUrl && (
              <Button href={banner.linkUrl} variant="gold" size="lg" className="mt-6">
                Shop Now
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex h-[60vh] min-h-[420px] w-full items-center overflow-hidden bg-gradient-to-br from-maroon-900 via-maroon-700 to-maroon-600 sm:h-[70vh]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-300">New Season Edit</p>
        <h1 className="font-display mt-3 max-w-xl text-4xl font-semibold text-white sm:text-5xl">
          Timeless Sarees, Handpicked for You
        </h1>
        <p className="mt-4 max-w-md text-white/80">
          Silk, cotton and designer sarees sourced with care — fresh arrivals every week.
        </p>
        <Button href="/shop" variant="gold" size="lg" className="mt-6">
          Shop Sarees
        </Button>
      </div>
    </section>
  );
}
