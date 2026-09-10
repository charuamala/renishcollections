import Image from "next/image";
import Link from "next/link";

export function CategoryGrid({ categories }: { categories: { name: string; slug: string; imageUrl: string | null }[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`} className="group flex flex-col items-center gap-2">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-cream sm:h-28 sm:w-28">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-lg text-maroon-600">
                  {category.name.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-center text-sm font-medium text-charcoal">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
