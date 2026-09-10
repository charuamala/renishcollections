"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/authorization";
import { updateProfileSchema, changePasswordSchema } from "@/schemas/account.schema";
import { prisma } from "@/lib/prisma";
import { verifyPassword, updatePassword } from "@/services/user.service";

export interface AccountFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });
  revalidatePath("/account");
  return { success: true };
}

export async function changePasswordAction(_prevState: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!dbUser?.passwordHash || !(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) {
    return { error: "Current password is incorrect" };
  }

  await updatePassword(user.id, parsed.data.newPassword);
  return { success: true };
}
