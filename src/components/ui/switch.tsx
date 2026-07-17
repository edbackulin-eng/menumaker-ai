"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, id, label, description, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const descriptionId = description ? `${switchId}-description` : undefined;

    const control = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        aria-describedby={descriptionId}
        className={cn(
          // neutral-600 for the unchecked track: on a dark surface the old
          // light-theme neutral-300 read as an *active* control rather than
          // an off one.
          "peer duration-fast relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-neutral-600 transition-colors",
          "focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "data-[state=checked]:bg-accent-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "duration-fast block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
            "data-[state=checked]:translate-x-[18px]",
          )}
        />
      </SwitchPrimitive.Root>
    );

    if (!label) {
      return control;
    }

    return (
      <div className="flex items-start gap-2.5">
        {control}
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor={switchId}
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
  },
);
Switch.displayName = "Switch";
