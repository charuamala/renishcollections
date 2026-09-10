"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscribeSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address") });

export async function subscribeToNewsletterAction(_prevState: unknown, formData: FormData) {
  const parsed = subscribeSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { isSubscribed: true },
    create: { email: parsed.data.email },
  });

  return { success: true, message: "You're subscribed! Watch your inbox for new arrivals and offers." };
}
