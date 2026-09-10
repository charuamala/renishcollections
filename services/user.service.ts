import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { SignUpInput } from "@/schemas/auth.schema";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function verifyPassword(plainPassword: string, passwordHash: string) {
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function createCustomer(input: SignUpInput) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("An account with this email already exists");
  }

  if (input.phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone: input.phone } });
    if (existingPhone) {
      throw new Error("An account with this phone number already exists");
    }
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      passwordHash,
      role: "CUSTOMER",
    },
  });
}

export async function updatePassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

/** Always succeeds even for an unknown email — callers must not reveal whether an account exists. */
export async function createPasswordResetToken(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });
  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    throw new Error("This reset link is invalid or has expired");
  }

  await updatePassword(record.userId, newPassword);
  await prisma.passwordResetToken.delete({ where: { id: record.id } });
}
