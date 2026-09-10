import Link from "next/link";
import { ACCOUNT_NAV_LINKS } from "@/lib/constants";
import { LogoutButton } from "@/components/account/logout-button";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1">
            {ACCOUNT_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-3 py-2 text-sm font-medium text-charcoal hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
