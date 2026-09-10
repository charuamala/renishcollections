import { prisma } from "@/lib/prisma";

export async function getFeaturedReviews(take = 6) {
  return prisma.review.findMany({
    where: { isApproved: true, isFeatured: true },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      isVerifiedPurchase: true,
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getApprovedReviewsForProduct(productId: string) {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
    select: {
      id: true,
      rating: true,
      title: true,
      body: true,
      images: true,
      isVerifiedPurchase: true,
      createdAt: true,
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function hasVerifiedPurchase(userId: string, productId: string) {
  const count = await prisma.orderItem.count({
    where: { productId, order: { userId, status: "DELIVERED" } },
  });
  return count > 0;
}

export async function hasReviewedProduct(userId: string, productId: string) {
  const existing = await prisma.review.findFirst({ where: { userId, productId } });
  return !!existing;
}

export async function createReview(input: {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}) {
  const isVerifiedPurchase = await hasVerifiedPurchase(input.userId, input.productId);
  return prisma.review.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      rating: input.rating,
      title: input.title,
      body: input.body,
      isVerifiedPurchase,
      isApproved: false,
    },
  });
}

export async function getProductRatingSummary(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { average: agg._avg.rating ?? 0, count: agg._count.rating };
}
