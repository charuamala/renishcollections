import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Admin Login | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm rounded-sm bg-white p-8 shadow-lg">
        <h1 className="font-display text-center text-xl font-semibold text-charcoal">
          {SITE_NAME} Admin
        </h1>
        <p className="mt-1 text-center text-sm text-ink-600">Staff login</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
