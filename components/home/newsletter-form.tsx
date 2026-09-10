"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletterAction } from "@/actions/newsletter.actions";

const initialState = { success: false, message: "" };

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletterAction, initialState);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-charcoal">Join our newsletter</p>
          <p className="text-xs text-ink-600">New arrivals and exclusive offers, straight to your inbox.</p>
        </div>
        <form action={formAction} className="flex w-full max-w-sm gap-2 sm:w-auto">
          <Input type="email" name="email" placeholder="you@example.com" required className="bg-white" />
          <Button type="submit" size="md" disabled={isPending}>
            {isPending ? "Joining..." : "Subscribe"}
          </Button>
        </form>
      </div>
      {state.message && (
        <p className={`text-xs ${state.success ? "text-success" : "text-error"}`}>{state.message}</p>
      )}
    </div>
  );
}
