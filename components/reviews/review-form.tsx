"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { submitReviewAction } from "@/actions/review.actions";

export function ReviewForm({ productId, isLoggedIn }: { productId: string; isLoggedIn: boolean }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-ink-600">
        <Link href="/login" className="font-medium text-maroon-600 hover:underline">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (rating === 0) {
          setResult({ success: false, error: "Please select a star rating" });
          return;
        }
        startTransition(async () => {
          const res = await submitReviewAction({ productId, rating, title, body });
          setResult(res);
          if (res.success) {
            setRating(0);
            setTitle("");
            setBody("");
          }
        });
      }}
    >
      <div>
        <Label>Your Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
              <Star className={`h-6 w-6 ${value <= rating ? "fill-gold-500 text-gold-500" : "text-border"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <div>
        <Label htmlFor="review-body">Review (optional)</Label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          className="w-full rounded-sm border border-border bg-white p-3 text-sm"
        />
      </div>
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
      {result && (
        <p className={`text-sm ${result.success ? "text-success" : "text-error"}`}>
          {result.success ? result.message : result.error}
        </p>
      )}
    </form>
  );
}
