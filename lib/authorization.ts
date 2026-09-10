import "server-only";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";

export const STAFF_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_MANAGER",
  "ORDER_MANAGER",
  "CONTENT_MANAGER",
];

export class UnauthorizedError extends Error {
  constructor(message = "You are not authorized to perform this action") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Throws unless there is a logged-in session. Use in Server Actions/Route Handlers. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("You must be logged in");
  return session.user;
}

/**
 * For Server Components (pages/layouts) rather than Server Actions: redirects
 * to login instead of throwing, since a thrown error would surface Next's
 * generic error boundary rather than a sensible redirect. Belt-and-suspenders
 * alongside proxy.ts, which already redirects unauthenticated /account page
 * navigations but does not cover every request path (see proxy.ts).
 */
export async function requireUserOrRedirect(callbackUrl: string) {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}

/** Throws unless the current session has one of the given staff roles. */
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || !role || !allowed.includes(role)) {
    throw new UnauthorizedError();
  }
  return session.user;
}

/** Throws unless the current session belongs to any admin-panel role. */
export async function requireStaff() {
  return requireRole(STAFF_ROLES);
}
