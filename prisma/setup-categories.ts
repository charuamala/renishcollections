/**
 * Sets up the saree category taxonomy from the owner brief. Safe to re-run:
 * every write is an upsert keyed on slug, nothing is deleted.
 *
 * Visibility rule: a saree category is published only once it has real
 * photography. Categories without photos are created hidden and can be
 * published from Admin → Categories when their images are added.
 *
 *   npm run db:setup-categories
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const photos = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/images/categories/${slug}/${slug}-${String(i + 1).padStart(2, "0")}.jpg`);

const banarasiTissuePhotos = photos("banarasi-tissue", 7);

// The owner's final list of eight saree categories, in display order.
const SAREE_CATEGORIES: { name: string; slug: string; description: string; images?: string[] }[] = [
  {
    name: "Banarasi Tissue Sarees",
    slug: "banarasi-tissue",
    description: "Lightweight tissue sarees with rich Banarasi woven motifs and a festive shimmer.",
    images: banarasiTissuePhotos,
  },
  { name: "Silk Sarees", slug: "silk", description: "Classic silk sarees for timeless occasions." },
  { name: "Kora Sarees", slug: "kora", description: "Elegant and lightweight sarees with a graceful finish." },
  { name: "Soft Silk Sarees", slug: "soft-silk", description: "Soft, comfortable and elegant silk sarees." },
  {
    name: "Katan Silk Sarees",
    slug: "katan-silk",
    description: "Premium silk with a rich traditional texture.",
    // Photos of the first Katan product (prisma/catalog.ts).
    images: ["01-wine-drape.jpg", "02-wine-with-blouse-piece.jpg"].map(
      (file) => `/images/products/banarasi-katan-soft-silk-ghungroo/${file}`,
    ),
  },
  {
    name: "Warm Silk Sarees",
    slug: "warm-silk",
    description: "Beautiful silk sarees with a luxurious finish.",
    // Photos of the first Warm Silk product (prisma/catalog.ts): card, hover, then banner.
    images: [
      "06-pink-green-drape.jpg",
      "09-turquoise-purple-drape.jpg",
      "03-mustard-red-drape.jpg",
      "12-mint-wine-drape.jpg",
      "01-royal-blue-sky-blue-drape.jpg",
    ].map((file) => `/images/products/banarasi-warm-soft-silk/${file}`),
  },
  {
    name: "Dupion Silk Sarees",
    slug: "dupion-silk",
    description: "Elegant textured silk for sophisticated occasions.",
    // Photos of the first Dupion product (prisma/catalog.ts): card, hover, then banner.
    images: [
      "01-navy-sky-blue-model.jpg",
      "08-purple-grey-model.jpg",
      "04-lavender-purple-model.jpg",
      "14-orange-lavender-model.jpg",
      "07-mint-lime-drape.jpg",
      "13-royal-blue-pink-drape.jpg",
    ].map((file) => `/images/products/banarasi-dupion-soft-silk/${file}`),
  },
  {
    name: "Viscose Silk Sarees",
    slug: "viscose-silk",
    description: "Beautiful silk-look sarees with a smooth finish.",
  },
];

// Categories outside the final list — hidden, never deleted. Standalone Banarasi and
// Tissue were replaced by Banarasi Tissue; the rest are seeded demo categories.
const RETIRED_SLUGS = [
  "banarasi",
  "tissue",
  "cotton-sarees",
  "designer-sarees",
  "wedding-sarees",
  "printed-sarees",
  "party-wear-sarees",
  "traditional-sarees",
];

async function main() {
  const sarees = await prisma.category.findUniqueOrThrow({ where: { slug: "sarees" } });

  // The seeded "Silk Sarees" row becomes the brief's `silk` category, keeping its products.
  const legacySilk = await prisma.category.findUnique({ where: { slug: "silk-sarees" } });
  const brandNewSilk = await prisma.category.findUnique({ where: { slug: "silk" } });
  if (legacySilk && !brandNewSilk) {
    await prisma.category.update({ where: { id: legacySilk.id }, data: { slug: "silk" } });
  }

  for (const [index, def] of SAREE_CATEGORIES.entries()) {
    const hasPhotos = !!def.images?.length;
    const imageFields = hasPhotos
      ? { imageUrl: def.images![0], galleryImages: def.images!.slice(1) }
      : { imageUrl: null, galleryImages: [] as string[] };

    // Placeholder images (seed demo data) don't count as real photography.
    const existing = await prisma.category.findUnique({ where: { slug: def.slug } });
    const existingHasRealPhoto = !!existing?.imageUrl && !existing.imageUrl.includes("picsum.photos");
    const isPublished = hasPhotos || (existingHasRealPhoto && existing!.isPublished);

    await prisma.category.upsert({
      where: { slug: def.slug },
      create: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        parentId: sarees.id,
        displayOrder: index,
        isPublished,
        ...imageFields,
      },
      update: {
        name: def.name,
        description: def.description,
        parentId: sarees.id,
        displayOrder: index,
        isPublished,
        // Ship this script's photos; clear seed placeholders; keep anything the admin uploaded.
        ...(hasPhotos ? imageFields : existingHasRealPhoto ? {} : { imageUrl: null }),
      },
    });
  }

  for (const [index, slug] of RETIRED_SLUGS.entries()) {
    await prisma.category.updateMany({ where: { slug }, data: { isPublished: false, displayOrder: 100 + index } });
  }

  // Replace the parent's placeholder image with a real saree photo.
  await prisma.category.update({
    where: { id: sarees.id },
    data: {
      imageUrl: banarasiTissuePhotos[0],
      description: "Sarees chosen with care for weddings, festivals and every occasion.",
      seoTitle: "Buy Sarees Online",
      seoDescription:
        "Shop elegant sarees at Renish Collections. Discover beautiful designs for weddings, festivals and special occasions.",
    },
  });

  const summary = await prisma.category.findMany({
    where: { parentId: sarees.id },
    orderBy: [{ isPublished: "desc" }, { displayOrder: "asc" }],
    select: { name: true, slug: true, isPublished: true },
  });
  console.table(summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
