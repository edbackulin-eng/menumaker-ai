import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("border-border flex flex-col gap-4 border-b pb-6", className)} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="text-body-sm text-foreground-secondary flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={isLast ? "text-foreground" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="size-3.5" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-h4 text-foreground">{title}</h1>
          {description && <p className="text-body text-foreground-secondary">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
