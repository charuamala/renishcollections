import type { Metadata } from "next";
import { requireUserOrRedirect } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const sessionUser = await requireUserOrRedirect("/account");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-charcoal">My Profile</h1>
      <div className="mt-6 max-w-md space-y-4 rounded-sm border border-border bg-white p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Name</p>
          <p className="text-sm text-charcoal">{user.name || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Email</p>
          <p className="text-sm text-charcoal">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Phone</p>
          <p className="text-sm text-charcoal">{user.phone || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">Member Since</p>
          <p className="text-sm text-charcoal">
            {user.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
