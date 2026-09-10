import { prisma } from "@/lib/prisma";
import type { BannerPlacement } from "@prisma/client";

export interface BannerAdminInput {
  title: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  placement: BannerPlacement;
  displayOrder: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export async function listBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { displayOrder: "asc" }] });
}

function toBannerData(input: BannerAdminInput) {
  return {
    title: input.title,
    imageUrl: input.imageUrl,
    mobileImageUrl: input.mobileImageUrl || null,
    linkUrl: input.linkUrl || null,
    placement: input.placement,
    displayOrder: input.displayOrder,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    isActive: input.isActive,
  };
}

export async function createBannerAdmin(input: BannerAdminInput) {
  return prisma.banner.create({ data: toBannerData(input) });
}

export async function updateBannerAdmin(id: string, input: BannerAdminInput) {
  return prisma.banner.update({ where: { id }, data: toBannerData(input) });
}

export async function deleteBannerAdmin(id: string) {
  await prisma.banner.delete({ where: { id } });
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  return prisma.banner.update({ where: { id }, data: { isActive } });
}

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
