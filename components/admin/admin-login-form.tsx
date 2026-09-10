"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { adminLoginAction, type AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

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
    </form>
  );
}
