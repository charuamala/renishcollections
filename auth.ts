import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { loginSchema } from "@/schemas/auth.schema";
import { findUserByEmail, verifyPassword } from "@/services/user.service";
import { mergeGuestCartIntoUser } from "@/services/cart.service";
import { mergeGuestWishlistIntoUser } from "@/services/wishlist.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await findUserByEmail(email);
        if (!user || !user.passwordHash || !user.isActive) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      // Best-effort: a guest cart/wishlist cookie merge should never block login.
      await Promise.allSettled([mergeGuestCartIntoUser(user.id), mergeGuestWishlistIntoUser(user.id)]);
    },
  },
  callbacks: {
    // The JWT type's `id`/`role` fields are added via a local cast rather than
    // module augmentation — see the comment in types/next-auth.d.ts for why.
    async jwt({ token, user }) {
      const t = token as typeof token & { id: string; role: Role };
      if (user?.id) {
        t.id = user.id;
        t.role = user.role as Role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as typeof token & { id: string; role: Role };
      if (session.user) {
        session.user.id = t.id;
        session.user.role = t.role;
      }
      return session;
    },
  },
});
