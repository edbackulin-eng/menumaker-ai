import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={cn("bg-surface-secondary animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
