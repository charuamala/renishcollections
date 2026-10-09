/**
 * The store's real, owner-confirmed details (2026-09-27). Safe to re-run.
 * Later changes belong in Admin → Settings; update this file too if you want
 * a fresh environment to start with the same values.
 *
 *   npm run db:store-settings
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STORE = {
  storeName: "Renish Collections",
  legalName: "Renish Collections",
  address: "Chennai, Tamil Nadu",
  contactPhone: "+91 99404 10494",
  whatsappNumber: "+91 99404 10494",
  whatsappUrl: "https://wa.me/919940410494",
  contactEmail: "amalarajini.f@gmail.com",
  supportHours: "24/7",
  grievanceOfficerName: "Amala Rajini F",
  grievanceOfficerEmail: "amalarajini.f@gmail.com",
  deliveryTime: "3–5 days",
  returnPolicy: "We don't accept returns or exchanges.",
  codAvailable: false,
  taxPercentage: 0, // no GST charged for now
  freeShippingThreshold: null, // no free shipping
  // Not created yet — the storefront hides these links while they are empty.
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
};

async function main() {
  await prisma.siteSettings.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...STORE }, update: STORE });
  console.log("Store settings updated.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
