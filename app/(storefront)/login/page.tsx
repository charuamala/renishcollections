import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard title="Welcome Back" subtitle="Log in to your Renish Collections account">
      <LoginForm />
    </AuthCard>
  );
}
