import { prisma } from "@/lib/prisma";
import type { BannerPlacement } from "@prisma/client";

export async function getActiveBanners(placement: BannerPlacement) {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      placement,
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: { displayOrder: "asc" },
  });
}
