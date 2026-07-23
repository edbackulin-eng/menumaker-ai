import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional visual — e.g. example output mockups — shown above the title. Answers "what will I get" instead of just describing it in text (see Stage 13 UI critique). */
  preview?: React.ReactNode;
  /** Sizing for the preview slot. The default is intentionally narrow; a full-width showcase (the dashboard's layout carousel) overrides it. */
  previewClassName?: string;
  /** Lets a headline empty state carry a real heading weight instead of the default body size. */
  titleClassName?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  preview,
  previewClassName,
  titleClassName,
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
      {preview && <div className={cn("mb-2", previewClassName)}>{preview}</div>}
      {Icon && (
        <div className="bg-surface-secondary flex size-12 items-center justify-center rounded-full">
          <Icon className="text-foreground-tertiary size-6" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className={cn("text-body text-foreground font-medium", titleClassName)}>{title}</p>
        {description && (
          <p className="text-body-sm text-foreground-secondary max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
