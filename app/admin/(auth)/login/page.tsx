import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SITE_NAME } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-maroon-900 px-4">
      <Logo variant="stacked" tone="gold" eager className="h-28" />
      <div className="w-full max-w-sm rounded-sm bg-white p-8 shadow-lg">
        <h1 className="font-display text-center text-xl font-semibold text-charcoal">Staff login</h1>
        <p className="mt-1 text-center text-sm text-ink-600">{SITE_NAME} admin</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
