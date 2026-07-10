import { cn } from "@/lib/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function Container({ size = "xl", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    />
  );
}
