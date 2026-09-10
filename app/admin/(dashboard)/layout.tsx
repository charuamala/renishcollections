import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { STAFF_ROLES } from "@/lib/authorization";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-charcoal">
        <AdminSidebar />
      </aside>
      <div className="flex-1">
        <AdminTopbar name={session.user.name ?? null} role={session.user.role} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
