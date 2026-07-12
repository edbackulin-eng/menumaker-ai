"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  containerClassName?: string;
  triggerClassName?: string;
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Оберіть значення",
  label,
  error,
  helperText,
  disabled,
  name,
  required,
  containerClassName,
  triggerClassName,
}: SelectProps) {
  const generatedId = React.useId();
  const triggerId = generatedId;
  const descriptionId = error
    ? `${triggerId}-error`
    : helperText
      ? `${triggerId}-helper`
      : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <Label htmlFor={triggerId} required={required}>
          {label}
        </Label>
      )}
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectPrimitive.Trigger
          id={triggerId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
          className={cn(
            "border-border bg-surface text-body text-foreground duration-fast flex h-10 w-full items-center justify-between gap-2 rounded-sm border px-3 transition-colors",
            "data-[placeholder]:text-foreground-tertiary",
            "focus-visible:border-accent-400 focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-error-400 focus-visible:border-error-400 focus-visible:ring-error-400/30",
            triggerClassName,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="text-foreground-tertiary size-4" aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="border-border bg-surface data-[state=open]:animate-scale-in z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border shadow-md"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "text-body-sm text-foreground relative flex h-9 cursor-pointer items-center rounded-sm px-8 outline-none select-none",
                    "data-[highlighted]:bg-surface-secondary",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <SelectPrimitive.ItemIndicator className="absolute start-2 flex items-center">
                    <Check className="text-accent-400 size-4" aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error ? (
        <p id={descriptionId} className="text-body-sm text-error-600">
          {error}
        </p>
      ) : (
        helperText && (
          <p id={descriptionId} className="text-body-sm text-foreground-secondary">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
