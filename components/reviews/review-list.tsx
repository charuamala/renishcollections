import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/reviews/review-form";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { name: string | null };
}

export function ReviewList({
  productId,
  reviews,
  summary,
  isLoggedIn,
}: {
  productId: string;
  reviews: ReviewItem[];
  summary: { average: number; count: number };
  isLoggedIn: boolean;
}) {
  return (
    <section className="mt-4 border-t border-border pt-8">
      <h2 className="font-display text-xl font-semibold text-charcoal">Customer Reviews</h2>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.round(summary.average) ? "fill-gold-500 text-gold-500" : "text-border"}`}
            />
          ))}
        </div>
        <span className="text-sm text-ink-600">
          {summary.average.toFixed(1)} out of 5 ({summary.count} review{summary.count === 1 ? "" : "s"})
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-600">Be the first to review this product.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold-500 text-gold-500" : "text-border"}`}
                      />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && <Badge variant="success">Verified Purchase</Badge>}
                </div>
                {review.title && <p className="mt-2 text-sm font-semibold text-charcoal">{review.title}</p>}
                {review.body && <p className="mt-1 text-sm text-ink-600">{review.body}</p>}
                <p className="mt-2 text-xs text-ink-400">
                  {review.user.name ?? "Verified Customer"} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            ))
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-charcoal">Write a Review</p>
          <ReviewForm productId={productId} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </section>
  );
}
