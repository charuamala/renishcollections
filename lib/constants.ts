export const SITE_NAME = "Renish Collections";

export const SITE_DESCRIPTION =
  "Shop premium sarees online at Renish Collections — silk, cotton, designer and wedding sarees with fast shipping across India.";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const CURRENCY = "INR";

// Utility pages only — product categories are DB-driven (see services/category.service.ts)
// and are merged in alongside these by the Header component.
export const STATIC_NAV_LINKS = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Best Sellers", href: "/best-sellers" },
  { label: "Offers", href: "/offers" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const ACCOUNT_NAV_LINKS = [
  { label: "My Profile", href: "/account" },
  { label: "My Orders", href: "/account/orders" },
  { label: "My Wishlist", href: "/account/wishlist" },
  { label: "My Addresses", href: "/account/addresses" },
  { label: "Account Settings", href: "/account/settings" },
] as const;

export const DEFAULT_SOCIAL_LINKS = {
  instagram: "https://instagram.com/renishcollections",
  whatsapp: "https://wa.me/910000000000",
  facebook: "https://facebook.com/renishcollections",
  youtube: "https://youtube.com/@renishcollections",
};

export const GUEST_CART_COOKIE = "rc_guest_cart";
export const GUEST_WISHLIST_COOKIE = "rc_guest_wishlist";
