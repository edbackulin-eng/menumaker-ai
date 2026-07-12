"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const RANGES = [7, 30, 90] as const;

export interface DateRangeSelectorProps {
  days: number;
}

export function DateRangeSelector({ days }: DateRangeSelectorProps) {
  const router = useRouter();

  return (
    <div className="border-border inline-flex rounded-md border p-0.5">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => router.push(`/admin/statistics?days=${range}`)}
          className={cn(
            "text-body-sm rounded-sm px-3 py-1.5 font-medium transition-colors",
            days === range
              ? "bg-accent-400 text-white"
              : "text-foreground-secondary hover:bg-surface-secondary",
          )}
        >
          {range} днів
        </button>
      ))}
    </div>
  );
}
