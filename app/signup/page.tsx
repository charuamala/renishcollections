import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthCard title="Create an Account" subtitle="Join Renish Collections for faster checkout and order tracking">
      <SignupForm />
    </AuthCard>
  );
}
