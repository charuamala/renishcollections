import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  primary: "bg-maroon-600 text-ivory hover:bg-maroon-700",
  secondary: "bg-transparent border border-maroon-600 text-maroon-600 hover:bg-maroon-50",
  gold: "bg-gold-500 text-charcoal hover:bg-gold-600",
  ghost: "bg-transparent text-charcoal hover:bg-cream",
  danger: "bg-error text-white hover:opacity-90",
} as const;

const SIZE_CLASSES = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
} as const;

type Variant = keyof typeof VARIANT_CLASSES;
type Size = keyof typeof SIZE_CLASSES;

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2";

export function Button({ variant = "primary", size = "md", fullWidth, className, ...props }: ButtonProps) {
  const classes = cn(baseClasses, VARIANT_CLASSES[variant], SIZE_CLASSES[size], fullWidth && "w-full", className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { ...rest } = props as ButtonAsButton;
  return <button className={classes} {...rest} />;
}
