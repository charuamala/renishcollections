import Link from "next/link";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { auth } from "@/auth";
import { getCartItemCount } from "@/services/cart.service";

export async function MobileBottomNav() {
  const session = await auth();
  const cartCount = await getCartItemCount(session?.user?.id ?? null);

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: cartCount },
    { label: "Account", href: session?.user ? "/account" : "/login", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-ivory sm:hidden">
      {items.map(({ label, href, icon: Icon, badge }) => (
        <Link key={label} href={href} className="relative flex flex-col items-center gap-0.5 px-2 text-ink-600">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
          <span className="text-[10px]">{label}</span>
          {!!badge && (
            <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-maroon-600 text-[9px] font-semibold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
