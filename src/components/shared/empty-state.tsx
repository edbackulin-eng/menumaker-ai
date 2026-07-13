import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional visual — e.g. example output mockups — shown above the title. Answers "what will I get" instead of just describing it in text (see Stage 13 UI critique). */
  preview?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  preview,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {preview && <div className="mb-2">{preview}</div>}
      {Icon && (
        <div className="bg-surface-secondary flex size-12 items-center justify-center rounded-full">
          <Icon className="text-foreground-tertiary size-6" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-body text-foreground font-medium">{title}</p>
        {description && (
          <p className="text-body-sm text-foreground-secondary max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
