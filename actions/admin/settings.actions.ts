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
  // Fields absent from the form (e.g. logoUrl) come back as null; treat them as blank so validation passes.
  const get = (key: string) => formData.get(key) ?? "";
  const parsed = siteSettingsSchema.safeParse({
    storeName: get("storeName"),
    logoUrl: get("logoUrl"),
    faviconUrl: get("faviconUrl"),
    contactEmail: get("contactEmail"),
    contactPhone: get("contactPhone"),
    whatsappNumber: get("whatsappNumber"),
    address: get("address"),
    legalName: get("legalName"),
    supportHours: get("supportHours"),
    grievanceOfficerName: get("grievanceOfficerName"),
    grievanceOfficerEmail: get("grievanceOfficerEmail"),
    deliveryTime: get("deliveryTime"),
    returnPolicy: get("returnPolicy"),
    codAvailable: formData.get("codAvailable") === "on",
    instagramUrl: get("instagramUrl"),
    facebookUrl: get("facebookUrl"),
    youtubeUrl: get("youtubeUrl"),
    whatsappUrl: get("whatsappUrl"),
    taxPercentage: get("taxPercentage") || 0,
    freeShippingThreshold: get("freeShippingThreshold") || undefined,
    seoDefaultTitle: get("seoDefaultTitle"),
    seoDefaultDescription: get("seoDefaultDescription"),
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
    legalName: parsed.data.legalName || null,
    supportHours: parsed.data.supportHours || null,
    grievanceOfficerName: parsed.data.grievanceOfficerName || null,
    grievanceOfficerEmail: parsed.data.grievanceOfficerEmail || null,
    deliveryTime: parsed.data.deliveryTime || null,
    returnPolicy: parsed.data.returnPolicy || null,
    codAvailable: parsed.data.codAvailable,
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
