"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { Menu } from "@/lib/api-client/menus";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { MenuCard } from "@/components/dashboard/menu-card";

export interface MyMenusItem {
  menu: Menu;
  style: ResolvedMenuStyle;
  templateName: string;
}

export interface MyMenusViewProps {
  items: MyMenusItem[];
  /** Total across all pages — deliberately not the filtered count, so the number doesn't jump around while typing. */
  totalCount: number;
  freeMenusLeft: number;
  canCreate: boolean;
}

/**
 * The client half of My Menus: search has to filter without a round-trip, so
 * the header, grid and promo live here while the page stays a Server
 * Component that does the fetching and style resolution.
 *
 * Search filters the current page only (PAGE_SIZE = 12) — it is a "find the
 * card I can see" affordance, not a server-side query. Worth knowing before
 * anyone reports it as a bug on an account with more than 12 menus.
 */
export function MyMenusView({ items, totalCount, freeMenusLeft, canCreate }: MyMenusViewProps) {
  const t = useTranslations("dashboard.myMenus");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.menu.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="text-[17px] leading-6 font-medium">{t("title")}</h1>

        <div className="border-border bg-surface focus-within:border-border-strong duration-fast flex h-8 w-[170px] items-center gap-1.5 rounded-md border px-2.5 transition-colors">
          <Search className="text-foreground-secondary size-3.5 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            className="text-caption placeholder:text-foreground-tertiary min-w-0 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <p className="text-foreground-secondary mb-4 text-[12px] leading-4">
        {t("count", { count: totalCount })} · {t("freeMenusLeft", { count: freeMenusLeft })}
      </p>

      {filtered.length === 0 ? (
        <p className="text-foreground-secondary text-body-sm py-8 text-center">
          {t("noSearchResults", { query: query.trim() })}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {filtered.map((item) => (
            <MenuCard
              key={item.menu.id}
              menu={item.menu}
              style={item.style}
              templateName={item.templateName}
            />
          ))}
        </div>
      )}

      {/*
        Its own surface, not `bg-surface` — the promo is meant to read as a
        different kind of thing from the cards above it, so its fill and
        border are deliberately a separate token pair.
      */}
      {canCreate && (
        <div className="bg-promo border-promo-border mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-body-sm font-medium">{t("promoTitle")}</p>
            <p className="text-promo-foreground mt-[3px] text-[12px] leading-4">
              {t("promoSubtitle")}
            </p>
          </div>
          <Link
            href="/menus/new"
            className={buttonVariants({ className: "h-[34px] shrink-0 px-3.5 text-[13px]" })}
          >
            {t("promoCta")}
          </Link>
        </div>
      )}
    </>
  );
}
