"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction, changePasswordAction, type AccountFormState } from "@/actions/account.actions";

const initialState: AccountFormState = {};

export function ProfileSettingsForm({ name, phone }: { name: string | null; phone: string | null }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-3">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" defaultValue={name ?? ""} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} placeholder="10-digit mobile number" />
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Profile updated.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-3">
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>
      {state.error && <p className="text-sm text-error">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Password changed.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}
