import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { auth } from "@/auth";
import { getNavCategories } from "@/services/category.service";
import { getCartItemCount } from "@/services/cart.service";
import { SITE_NAME, STATIC_NAV_LINKS } from "@/lib/constants";
import { SearchBar } from "@/components/products/search-bar";
import { MobileMenu } from "@/components/layout/mobile-menu";

export async function Header() {
  const [session, categories] = await Promise.all([auth(), getNavCategories()]);
  const cartCount = await getCartItemCount(session?.user?.id ?? null);

  const navLinks = [
    { label: "Home", href: "/" },
    ...categories.map((c) => ({ label: c.name, href: `/${c.slug}` })),
    ...STATIC_NAV_LINKS,
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileMenu navLinks={navLinks} />

        <Link href="/" className="font-display text-xl font-semibold tracking-wide text-maroon-700 shrink-0">
          {SITE_NAME}
        </Link>

        <SearchBar className="hidden max-w-md flex-1 md:block" />

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal transition-colors hover:text-maroon-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-4">
          <Link
            href={session?.user ? "/account" : "/login"}
            aria-label={session?.user ? "My account" : "Login"}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream"
          >
            <User className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-cream sm:flex"
          >
            <Heart className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-maroon-600 text-[10px] font-semibold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <SearchBar className="mx-4 mb-3 md:hidden" />
    </header>
  );
}
