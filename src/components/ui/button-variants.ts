import { cva } from "class-variance-authority";

/**
 * Split out of button.tsx (which is "use client") specifically so it can be
 * called as a plain function from Server Components — e.g. styling a plain
 * `<Link>` as a button. Next.js treats every export of a "use client" module
 * as an opaque client reference to any importer, server or client; calling
 * one as a function from server-rendered code throws
 * ("Attempted to call buttonVariants() from the server..."), even though
 * this function itself has no client-only dependency. Discovered for real
 * via Stage 8 testing — button.tsx re-exports this for client-side callers
 * that want it alongside the actual `Button` component.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // accent-600 (not the brand accent-500) is the fill here on purpose:
        // white 14px labels need 4.5:1 and accent-500 only reaches 4.47:1.
        // See docs/design-tokens.md.
        primary: "bg-accent-600 text-white hover:bg-accent-500 active:bg-accent-700",
        secondary:
          "border border-border bg-surface text-foreground hover:bg-surface-secondary active:bg-neutral-700",
        ghost: "text-foreground hover:bg-surface-secondary active:bg-neutral-700",
        // error-400 is the lighter red of the dark palette; black text on it
        // beats white for contrast.
        destructive: "bg-error-400 text-neutral-950 hover:bg-error-600 active:bg-error-600",
      },
      size: {
        sm: "h-8 px-3 text-body-sm",
        md: "h-10 px-4 text-body",
        lg: "h-12 px-6 text-body-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
