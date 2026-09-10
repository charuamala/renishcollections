"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authorization";
import { logAdminAction } from "@/lib/audit";
import { bannerAdminSchema } from "@/schemas/admin/banner.schema";
import { createBannerAdmin, updateBannerAdmin, deleteBannerAdmin, toggleBannerActive } from "@/services/banner.service";

const BANNER_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] as const;

export interface BannerFormState {
  error?: string;
  success?: boolean;
}

function parseForm(formData: FormData) {
  return bannerAdminSchema.safeParse({
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    mobileImageUrl: formData.get("mobileImageUrl"),
    linkUrl: formData.get("linkUrl"),
    placement: formData.get("placement"),
    displayOrder: formData.get("displayOrder") || 0,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createBannerAction(_prevState: BannerFormState, formData: FormData): Promise<BannerFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the banner details" };

  const user = await requireRole([...BANNER_ROLES]);
  const banner = await createBannerAdmin(parsed.data);
  await logAdminAction({ adminId: user.id, action: "banner.created", entityType: "Banner", entityId: banner.id });

  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateBannerAction(
  id: string,
  _prevState: BannerFormState,
  formData: FormData,
): Promise<BannerFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the banner details" };

  const user = await requireRole([...BANNER_ROLES]);
  await updateBannerAdmin(id, parsed.data);
  await logAdminAction({ adminId: user.id, action: "banner.updated", entityType: "Banner", entityId: id });

  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  const user = await requireRole([...BANNER_ROLES]);
  await deleteBannerAdmin(id);
  await logAdminAction({ adminId: user.id, action: "banner.deleted", entityType: "Banner", entityId: id });
  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
}

export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  const user = await requireRole([...BANNER_ROLES]);
  await toggleBannerActive(id, isActive);
  await logAdminAction({
    adminId: user.id,
    action: isActive ? "banner.activated" : "banner.deactivated",
    entityType: "Banner",
    entityId: id,
  });
  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
}
