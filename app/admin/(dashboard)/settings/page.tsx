import type { Metadata } from "next";
import { getSiteSettings } from "@/services/settings.service";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Store Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-charcoal">Store Settings</h1>
      <SettingsForm
        settings={{
          ...settings,
          taxPercentage: settings.taxPercentage.toString(),
          freeShippingThreshold: settings.freeShippingThreshold?.toString() ?? null,
        }}
      />
    </div>
  );
}
