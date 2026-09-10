"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PRODUCT_SELECT } from "@/services/product.service";

const schema = z.object({ slugs: z.array(z.string()).max(12) });

export async function getProductsBySlugsAction(input: z.infer<typeof schema>) {
  const { slugs } = schema.parse(input);
  if (slugs.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: "PUBLISHED", deletedAt: null },
    select: PUBLIC_PRODUCT_SELECT,
  });

  // Preserve the caller's (most-recent-first) order.
  return slugs.map((slug) => products.find((p) => p.slug === slug)).filter((p) => p !== undefined);
}
