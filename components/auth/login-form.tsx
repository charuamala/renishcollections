"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginAction, type AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Logging in..." : "Log In"}
      </Button>
      <div className="flex justify-between text-xs text-ink-600">
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}
