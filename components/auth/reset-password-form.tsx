"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { resetPasswordAction } from "@/actions/auth.actions";
import type { AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState & { success?: boolean } = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="text-sm text-charcoal">
        <p>Your password has been reset.</p>
        <Link href="/login" className="mt-3 inline-block font-medium text-maroon-600 hover:underline">
          Log in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
