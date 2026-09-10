"use server";

import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { signIn } from "@/auth";
import { signUpSchema, forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth.schema";
import { createCustomer, createPasswordResetToken, resetPasswordWithToken } from "@/services/user.service";
import { sendMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/constants";

export interface AuthFormState {
  error?: string;
}

export async function loginAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/account",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error; // NEXT_REDIRECT and other framework signals must propagate
  }
}

export async function signupAction(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  try {
    await createCustomer(parsed.data);
  } catch (error) {
    // A concurrent signup can slip past the pre-check race; Prisma's own
    // unique-constraint error is the backstop, mapped to a friendly message
    // instead of leaking its raw "Unique constraint failed on..." text.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "An account with this email or phone number already exists" };
    }
    if (error instanceof Error) return { error: error.message };
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/account",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — please log in" };
    }
    throw error;
  }
}

export async function forgotPasswordAction(
  _prevState: AuthFormState & { success?: boolean },
  formData: FormData,
): Promise<AuthFormState & { success?: boolean }> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  const token = await createPasswordResetToken(parsed.data.email);
  if (token) {
    const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
    await sendMail({
      to: parsed.data.email,
      subject: "Reset your Renish Collections password",
      html: `<p>Click below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  // Always the same response — don't reveal whether the email is registered.
  return { success: true };
}

export async function resetPasswordAction(
  _prevState: AuthFormState & { success?: boolean },
  formData: FormData,
): Promise<AuthFormState & { success?: boolean }> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details" };
  }

  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    throw error;
  }
}
