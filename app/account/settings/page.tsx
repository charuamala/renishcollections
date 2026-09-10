import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { ProfileSettingsForm, ChangePasswordForm } from "@/components/account/settings-forms";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const sessionUser = await requireUserOrRedirect("/account/settings");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { name: true, phone: true, passwordHash: true },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-charcoal">Account Settings</h1>
        <div className="mt-6">
          <ProfileSettingsForm name={user.name} phone={user.phone} />
        </div>
      </div>

      {user.passwordHash && (
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Change Password</h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}
