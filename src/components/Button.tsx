import { forwardRef } from "react";
import Link, { type LinkProps } from "next/link";

// The ONE coral-filled action per screen. Every other interactive element
// (options, links, secondary actions) stays thin-lined per the brand spec --
// coral fill is reserved for the single primary action.
const PRIMARY_BUTTON_CLASSES =
  "flex h-13 w-full items-center justify-center rounded-lg bg-coral px-5 text-[15px] font-semibold text-white transition-colors active:bg-coral-active disabled:opacity-40";

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function PrimaryButton({ className = "", children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`${PRIMARY_BUTTON_CLASSES} ${className}`}
      style={{ height: 52 }}
      {...props}
    >
      {children}
    </button>
  );
});

// Same look as PrimaryButton, but renders an <a> via next/link -- avoids
// nesting a <button> inside an <a>, which is invalid HTML.
export function PrimaryLinkButton({
  children,
  className = "",
  ...props
}: LinkProps & { children: React.ReactNode; className?: string }) {
  return (
    <Link
      className={`${PRIMARY_BUTTON_CLASSES} ${className}`}
      style={{ height: 52 }}
      {...props}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className="body-text text-center text-coral underline-offset-4 hover:underline"
      {...props}
    >
      {children}
    </a>
  );
}
