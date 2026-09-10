import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const tokenValue = typeof token === "string" ? token : "";

  return (
    <AuthCard title="Reset Password">
      {tokenValue ? (
        <ResetPasswordForm token={tokenValue} />
      ) : (
        <p className="text-sm text-error">This reset link is missing a token. Please request a new one.</p>
      )}
    </AuthCard>
  );
}
