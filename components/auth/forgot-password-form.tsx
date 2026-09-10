"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { forgotPasswordAction } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState & { success?: boolean } = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-charcoal">
        If an account exists for that email, we&apos;ve sent a password reset link. Check your inbox.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
