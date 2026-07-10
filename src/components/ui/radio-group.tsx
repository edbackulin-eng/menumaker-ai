"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("flex flex-col gap-3", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label?: string;
  description?: string;
}

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, id, label, description, ...props }, ref) => {
  const generatedId = React.useId();
  const itemId = id ?? generatedId;
  const descriptionId = description ? `${itemId}-description` : undefined;

  const radio = (
    <RadioGroupPrimitive.Item
      ref={ref}
      id={itemId}
      aria-describedby={descriptionId}
      className={cn(
        "peer border-border-strong bg-surface duration-fast flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
        "hover:border-accent-400",
        "focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
        "data-[state=checked]:border-accent-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="bg-accent-400 size-2.5 rounded-full" />
    </RadioGroupPrimitive.Item>
  );

  if (!label) {
    return radio;
  }

  return (
    <div className="flex items-start gap-2.5">
      {radio}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={itemId}
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
RadioGroupItem.displayName = "RadioGroupItem";
