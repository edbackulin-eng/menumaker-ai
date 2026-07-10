import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * Purely decorative (aria-hidden) by design — a spinner icon alone isn't a
 * meaningful accessible unit. Consumers that need an announced loading
 * state (e.g. Button's isLoading) should pair it with `aria-busy` and/or
 * sr-only text on the container instead of relying on this icon.
 */
export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <Loader2
      aria-hidden="true"
      className={cn("animate-spin text-current", sizeClasses[size], className)}
      {...props}
    />
  );
}
