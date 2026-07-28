"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "children"
> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, id, label, description, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      aria-describedby={descriptionId}
      className={cn(
        "peer border-border-strong bg-surface duration-fast flex size-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors",
        "hover:border-accent-400",
        "focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
        "data-[state=checked]:border-accent-400 data-[state=checked]:bg-accent-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return checkbox;
  }

  return (
    <div className="flex items-start gap-2.5">
      {checkbox}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={checkboxId}
          className="text-body-sm text-foreground font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-body-sm text-foreground-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
Checkbox.displayName = "Checkbox";
