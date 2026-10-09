/**
 * Home page hero slides supplied by the owner. Safe to re-run: slides are
 * upserted by id. Later changes (order, links, on/off) belong in Admin → Banners.
 *
 *   npm run db:banners
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The artwork already contains its own headline text, so `title` is used as the image's alt text.
const HOME_HERO_SLIDES = [
  {
    id: "home-hero-surat-to-doorstep",
    title: "Renish Collections — from Surat to your doorstep. Beautiful sarees, better value, delivered across India.",
    imageUrl: "/images/banners/renish-surat-to-your-doorstep.jpg",
    linkUrl: "/sarees",
  },
  {
    id: "home-hero-saroj-festive",
    title: "Saroj festive saree collection in red, green, yellow and blue with gold zari borders",
    imageUrl: "/images/banners/saroj-festive-collection.jpg",
    linkUrl: "/sarees",
  },
  {
    id: "home-hero-saroj-glamourous",
    title: "Saroj Glamourous Fashion collection of colourful woven sarees",
    imageUrl: "/images/banners/saroj-glamourous-fashion.jpg",
    linkUrl: "/sarees",
  },
];

async function main() {
  // The seeded demo slide (stock photo, "Up to 30% Off") is switched off, not deleted.
  await prisma.banner.updateMany({ where: { id: "seed-home-hero-banner" }, data: { isActive: false } });

  for (const [index, slide] of HOME_HERO_SLIDES.entries()) {
    const data = { ...slide, placement: "HOME_HERO" as const, displayOrder: index, isActive: true };
    await prisma.banner.upsert({ where: { id: slide.id }, create: data, update: data });
  }
  console.log(`Home hero: ${HOME_HERO_SLIDES.length} slides active.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
