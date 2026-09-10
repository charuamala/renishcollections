import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed middleware.ts -> proxy.ts. This only gives a fast
// redirect for page navigations; Server Actions and Route Handlers are NOT
// guaranteed to pass through this matcher, so every admin/account
// server action and API route must independently re-check the session
// (see lib/authorization.ts).
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = nextUrl.pathname.startsWith("/account");

  if (isAdminRoute) {
    const isStaff =
      role === "SUPER_ADMIN" ||
      role === "ADMIN" ||
      role === "PRODUCT_MANAGER" ||
      role === "ORDER_MANAGER" ||
      role === "CONTENT_MANAGER";
    if (!isLoggedIn || !isStaff) {
      const loginUrl = new URL("/admin/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAccountRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
