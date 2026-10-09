import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/services/settings.service";
import { getSubcategoryCards } from "@/services/category.service";
import { Logo } from "@/components/layout/logo";
import { CategoryGrid } from "@/components/home/category-grid";
import { WhyShopWithUs } from "@/components/home/why-shop-with-us";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Renish Collections is a saree boutique from Chennai — handpicked Banarasi tissue and dupion silk sarees.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getSubcategoryCards("sarees")]);
  const city = settings.address?.split(",")[0]?.trim();
  const photos = categories.flatMap((c) => (c.imageUrl ? [c.imageUrl] : [])).slice(0, 2);

  return (
    <>
      <section className="bg-maroon-900 px-4 py-14 text-center sm:py-20">
        <Logo variant="stacked" tone="gold" eager className="mx-auto h-24 sm:h-28" alt="" />
        <h1 className="mt-8 font-display text-3xl font-semibold text-ivory sm:text-4xl">About Renish Collections</h1>
        {city && <p className="mt-3 text-base text-gold-300">A saree boutique from {city}</p>}
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">Our story</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Renish Collections is a saree boutique{city ? ` based in ${city}` : ""}. We bring together sarees we love —
            from shimmering Banarasi tissue to rich dupion soft silk — each chosen for weddings, festivals and the
            everyday occasions that matter.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Every saree is checked before it reaches you
            {settings.supportHours ? `, and we're here to help ${settings.supportHours} on call or WhatsApp` : ""}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/sarees">Shop Sarees</Button>
            <Button href="/contact" variant="secondary">
              Contact Us
            </Button>
          </div>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((src, index) => (
              <div
                key={src}
                className={`relative aspect-[3/4] overflow-hidden rounded-card bg-cream ${index === 1 ? "mt-10" : ""}`}
              >
                <Image src={src} alt="" fill sizes="(min-width: 768px) 25vw, 45vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      <WhyShopWithUs
        deliveryTime={settings.deliveryTime}
        contactPhone={settings.contactPhone}
        supportHours={settings.supportHours}
      />

      <CategoryGrid categories={categories} title="Explore our sarees" />
    </>
  );
}
