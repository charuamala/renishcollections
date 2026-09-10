import Link from "next/link";
import { signOut } from "@/auth";
import { SITE_NAME } from "@/lib/constants";
import { Role } from "@prisma/client";

export function AdminTopbar({ name, role }: { name: string | null; role: Role }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
      <Link href="/admin/dashboard" className="font-display text-sm font-semibold text-maroon-700">
        {SITE_NAME} Admin
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-ink-600">
          {name ?? "Admin"} · <span className="text-ink-400">{role.replace("_", " ")}</span>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit" className="font-medium text-maroon-600 hover:underline">
            Log Out
          </button>
        </form>
      </div>
    </header>
  );
}
