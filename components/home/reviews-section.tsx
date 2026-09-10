import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  user: { name: string | null };
  product: { name: string; slug: string };
}

export function ReviewsSection({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">What Our Customers Say</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-sm border border-border bg-white p-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? "fill-gold-500 text-gold-500" : "text-border"}`}
                />
              ))}
              {review.isVerifiedPurchase && (
                <Badge variant="success" className="ml-2">
                  Verified
                </Badge>
              )}
            </div>
            {review.title && <p className="mt-3 text-sm font-semibold text-charcoal">{review.title}</p>}
            {review.body && <p className="mt-1 text-sm text-ink-600">{review.body}</p>}
            <p className="mt-3 text-xs text-ink-400">
              {review.user.name ?? "Verified Customer"} · {review.product.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
