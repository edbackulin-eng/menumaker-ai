"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, containerClassName, label, error, helperText, required, id, rows = 4, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const descriptionId = error
      ? `${textareaId}-error`
      : helperText
        ? `${textareaId}-helper`
        : undefined;

    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={descriptionId}
          className={cn(
            "border-border bg-surface text-body text-foreground placeholder:text-foreground-tertiary duration-fast w-full resize-y rounded-sm border px-3 py-2 transition-colors",
            "focus-visible:border-accent-400 focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-error-400 focus-visible:border-error-400 focus-visible:ring-error-400/30",
            className,
          )}
          {...props}
        />
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
Textarea.displayName = "Textarea";
