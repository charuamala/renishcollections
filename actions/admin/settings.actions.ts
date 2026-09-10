"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { siteSettingsSchema } from "@/schemas/admin/settings.schema";
import { updateSiteSettings } from "@/services/settings.service";

const SETTINGS_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateSiteSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const parsed = siteSettingsSchema.safeParse({
    storeName: formData.get("storeName"),
    logoUrl: formData.get("logoUrl"),
    faviconUrl: formData.get("faviconUrl"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    whatsappNumber: formData.get("whatsappNumber"),
    address: formData.get("address"),
    instagramUrl: formData.get("instagramUrl"),
    facebookUrl: formData.get("facebookUrl"),
    youtubeUrl: formData.get("youtubeUrl"),
    whatsappUrl: formData.get("whatsappUrl"),
    taxPercentage: formData.get("taxPercentage") || 0,
    freeShippingThreshold: formData.get("freeShippingThreshold") || undefined,
    seoDefaultTitle: formData.get("seoDefaultTitle"),
    seoDefaultDescription: formData.get("seoDefaultDescription"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the settings" };

  const user = await requireRole([...SETTINGS_ROLES]);
  await updateSiteSettings({
    storeName: parsed.data.storeName,
    logoUrl: parsed.data.logoUrl || null,
    faviconUrl: parsed.data.faviconUrl || null,
    contactEmail: parsed.data.contactEmail || null,
    contactPhone: parsed.data.contactPhone || null,
    whatsappNumber: parsed.data.whatsappNumber || null,
    address: parsed.data.address || null,
    instagramUrl: parsed.data.instagramUrl || null,
    facebookUrl: parsed.data.facebookUrl || null,
    youtubeUrl: parsed.data.youtubeUrl || null,
    whatsappUrl: parsed.data.whatsappUrl || null,
    taxPercentage: parsed.data.taxPercentage,
    freeShippingThreshold: parsed.data.freeShippingThreshold ?? null,
    seoDefaultTitle: parsed.data.seoDefaultTitle || null,
    seoDefaultDescription: parsed.data.seoDefaultDescription || null,
  });
  await logAdminAction({ adminId: user.id, action: "settings.updated", entityType: "SiteSettings", entityId: "singleton" });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}
