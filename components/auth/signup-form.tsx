"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signupAction, type AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="10-digit mobile number" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <p className="mt-1 text-xs text-ink-400">At least 8 characters, with an uppercase letter and a number.</p>
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-center text-xs text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-maroon-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
