import { prisma } from "@/lib/prisma";
import type { AddressInput } from "@/schemas/address.schema";

export async function getAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(userId: string, input: AddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.create({
    data: { ...input, line2: input.line2 || null, userId },
  });
}

export async function updateAddress(userId: string, addressId: string, input: AddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  return prisma.address.updateMany({
    where: { id: addressId, userId },
    data: { ...input, line2: input.line2 || null },
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  return prisma.address.deleteMany({ where: { id: addressId, userId } });
}
