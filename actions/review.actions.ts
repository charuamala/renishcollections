"use server";

import { revalidatePath } from "next/cache";
import { requireUser, UnauthorizedError } from "@/lib/authorization";
import { submitReviewSchema } from "@/schemas/review.schema";
import { createReview, hasReviewedProduct } from "@/services/review.service";

export async function submitReviewAction(input: unknown) {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  try {
    const user = await requireUser();
    const alreadyReviewed = await hasReviewedProduct(user.id, parsed.data.productId);
    if (alreadyReviewed) {
      return { success: false, error: "You have already reviewed this product" };
    }

    await createReview({ userId: user.id, ...parsed.data });
    revalidatePath("/", "layout");
    return { success: true, message: "Thank you! Your review is pending approval." };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { success: false, error: "Please log in to leave a review" };
    }
    throw error;
  }
}
