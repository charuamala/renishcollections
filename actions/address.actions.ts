"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/authorization";
import { addressSchema } from "@/schemas/address.schema";
import { createAddress, updateAddress, deleteAddress } from "@/services/address.service";

export interface AddressFormState {
  error?: string;
  success?: boolean;
}

function parseFormData(formData: FormData) {
  return addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    isDefault: formData.get("isDefault") === "on",
  });
}

export async function createAddressAction(_prevState: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireUser();
  await createAddress(user.id, parsed.data);
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddressAction(
  addressId: string,
  _prevState: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your details" };

  const user = await requireUser();
  await updateAddress(user.id, addressId, parsed.data);
  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const user = await requireUser();
  await deleteAddress(user.id, addressId);
  revalidatePath("/account/addresses");
}
