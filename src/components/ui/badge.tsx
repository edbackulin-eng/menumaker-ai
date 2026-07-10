import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-secondary text-foreground-secondary",
        accent: "bg-accent-50 text-accent-800",
        success: "bg-success-50 text-success-600",
        warning: "bg-warning-50 text-warning-600",
        error: "bg-error-50 text-error-600",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
