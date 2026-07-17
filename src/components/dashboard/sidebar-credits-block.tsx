"use client";

import { useTranslations } from "next-intl";

import type { CreditBlock } from "@/services/dashboard/get-summary";
import { Link } from "@/i18n/navigation";

export interface SidebarCreditsBlockProps {
  block: CreditBlock;
}

/**
 * The sidebar's bottom anchor. One layout, two data modes — see CreditBlock
 * in services/dashboard/get-summary.ts for why the "free" mode exists at all
 * (short version: nobody has purchasable credits yet, so a credits-only bar
 * would read empty for every user).
 *
 * The bar always renders. `fillRatio` is pre-clamped server-side, so there
 * is no divide-by-zero or over-100% case to defend against here.
 */
export function SidebarCreditsBlock({ block }: SidebarCreditsBlockProps) {
  const t = useTranslations("nav.credits");

  const label = block.mode === "free" ? t("freeMenuTitle") : t("creditsTitle");
  const value =
    block.mode === "free"
      ? t("freeMenuValue", { left: block.value, total: block.total })
      : t("creditsValue", { left: block.value, total: block.total });

  return (
    <div className="border-border bg-surface mt-auto flex flex-col gap-2.5 rounded-[10px] border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-caption text-foreground-secondary">{label}</span>
        <span className="text-caption text-foreground font-medium">{value}</span>
      </div>

      <div
        className="h-[5px] w-full overflow-hidden rounded-full bg-neutral-700"
        role="progressbar"
        aria-valuenow={Math.round(block.fillRatio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="bg-accent-500 h-full rounded-full"
          style={{ width: `${block.fillRatio * 100}%` }}
        />
      </div>

      <Link
        href="/dashboard/credits"
        className="border-border-strong text-body-sm text-foreground hover:bg-surface-secondary duration-fast flex h-8 items-center justify-center rounded-md border transition-colors"
      >
        {t("topUp")}
      </Link>
    </div>
  );
}
