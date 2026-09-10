import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

// Deliberately not augmenting the JWT interface here: it's declared in
// @auth/core/jwt and re-exported via `export *` from next-auth/jwt, but
// which @auth/core copy resolves (top-level vs. nested under next-auth/)
// depends on npm's hoisting for a given install and isn't stable — an
// augmentation that silently stops merging would fail with confusing
// "unknown" errors. auth.ts casts the two JWT fields locally instead.
