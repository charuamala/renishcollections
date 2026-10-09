import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryCardData } from "@/services/category.service";

function countLabel(count: number) {
  if (count === 0) return "Coming soon";
  return `${count} ${count === 1 ? "saree" : "sarees"}`;
}

const frameClasses =
  "relative overflow-hidden rounded-card border border-border bg-cream transition-[border-color,box-shadow,translate] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-gold-400 group-hover:shadow-[0_8px_24px_-8px_rgba(36,31,28,0.18)] group-focus-visible:border-gold-400";

function CardImages({ category, sizes }: { category: CategoryCardData; sizes: string }) {
  if (!category.imageUrl) {
    return <div className="flex h-full items-center justify-center font-display text-3xl text-maroon-600/40">RC</div>;
  }
  return (
    <>
      <Image src={category.imageUrl} alt="" fill sizes={sizes} className="object-cover" />
      {category.hoverImageUrl && (
        <Image
          src={category.hoverImageUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </>
  );
}

function ExploreLabel({ children = "Explore" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex h-10 items-center gap-1.5 rounded-[4px] border border-maroon-600 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-maroon-600 transition-colors group-hover:bg-maroon-600 group-hover:text-ivory">
      {children}
      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
    </span>
  );
}

/** One live category: a wide feature card instead of a lone tile in a 3-column grid. */
function FeatureCard({ category }: { category: CategoryCardData }) {
  const thumbnails = category.galleryImages.slice(1, 4);
  return (
    <Link href={category.href} className="group grid gap-6 md:grid-cols-12 md:items-center md:gap-10">
      <div className={cn(frameClasses, "aspect-[3/4] md:col-span-5")}>
        <CardImages category={category} sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
      <div className="md:col-span-7">
        <h3 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">{category.name}</h3>
        {category.description && <p className="mt-3 max-w-md text-base leading-relaxed text-ink-600">{category.description}</p>}
        <p className="mt-4 text-sm text-ink-500">{countLabel(category.productCount)}</p>
        {thumbnails.length > 0 && (
          <ul className="mt-6 grid max-w-md grid-cols-3 gap-3" aria-hidden="true">
            {thumbnails.map((src) => (
              <li key={src} className="relative aspect-[3/4] overflow-hidden rounded-card bg-cream">
                <Image src={src} alt="" fill sizes="(min-width: 768px) 140px, 30vw" className="object-cover" />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-8">
          <ExploreLabel>View Collection</ExploreLabel>
        </div>
      </div>
    </Link>
  );
}

function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link href={category.href} className="group flex flex-col">
      <div className={cn(frameClasses, "aspect-[3/4]")}>
        <CardImages category={category} sizes="(min-width: 1024px) 30vw, 50vw" />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-base font-semibold text-charcoal sm:font-display sm:text-2xl">{category.name}</h3>
        {category.description && <p className="mt-1 line-clamp-2 text-sm text-ink-600">{category.description}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <span className="text-sm text-ink-500">{countLabel(category.productCount)}</span>
          <ExploreLabel />
        </div>
      </div>
    </Link>
  );
}

export function CategoryGrid({
  categories,
  title = "Saree Categories",
  intro,
  embedded = false,
}: {
  categories: CategoryCardData[];
  title?: string;
  intro?: string;
  /** Rendered inside a page that already provides the container and side padding. */
  embedded?: boolean;
}) {
  if (categories.length === 0) return null;

  return (
    <section className={embedded ? "py-10" : "mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"}>
      <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm text-ink-600">{intro}</p>}

      <div className="mt-8">
        {categories.length === 1 ? (
          <FeatureCard category={categories[0]} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
