"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="text-foreground-tertiary pointer-events-none absolute left-3 flex [&_svg]:size-4">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={descriptionId}
            className={cn(
              "border-border bg-surface text-body text-foreground placeholder:text-foreground-tertiary duration-fast h-10 w-full rounded-sm border px-3 transition-colors",
              "focus-visible:border-accent-400 focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-error-400 focus-visible:border-error-400 focus-visible:ring-error-400/30",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="text-foreground-tertiary pointer-events-none absolute right-3 flex [&_svg]:size-4">
              {rightIcon}
            </span>
          )}
        </div>
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
  },
);
Input.displayName = "Input";
