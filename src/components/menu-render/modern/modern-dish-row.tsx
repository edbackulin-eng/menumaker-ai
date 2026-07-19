import { DishPhotoImage } from "@/components/menu-render/dish-photo-image";
import { ModernBadge } from "@/components/menu-render/modern/modern-badge";
import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuItem } from "@/services/ai/schemas/menu-content";

export interface ModernDishRowProps {
  item: MenuItem;
  /** Passed through to the photo placeholder, which colors itself deterministically per category. */
  categoryName: string;
  currency?: string;
  showBadges: boolean;
  isLast: boolean;
}

/**
 * One dish: 60×60 photo, name, dotted leader, gold serif price, then
 * description and badges underneath.
 *
 * The leader is a flex spacer with a dotted bottom border rather than a
 * repeated "." glyph — a glyph run would have to be measured and truncated
 * per row, whereas a flex child fills exactly the space left between an
 * unwrappable name and the price. `translateY(-3px)` drops the border off
 * the text baseline onto the optical midline; without it the dots sit level
 * with the descenders and read as an underline of the name.
 *
 * Photo goes through DishPhotoImage, so all four photo-fallback cases
 * (nothing found / rate limited / provider error / URL dead by render time)
 * land on the same category-colored placeholder the rest of the app uses —
 * a menu whose photos didn't resolve still looks deliberate.
 */
export function ModernDishRow({
  item,
  categoryName,
  currency,
  showBadges,
  isLast,
}: ModernDishRowProps) {
  const badges = showBadges ? (item.badges ?? []) : [];

  return (
    <div
      data-testid="modern-dish-row"
      style={{ display: "flex", gap: 11, marginBottom: isLast ? 0 : 16 }}
    >
      {/* 60×60 fixed, never flex-shrunk: the reference's photo column is a
          constant, and letting it compress on a long dish name would make
          rows visibly ragged down the column. */}
      <DishPhotoImage
        src={
          item.photoUrl ? dishPhotoUrlForEngine(item.photoUrl, "banner-two-column") : item.photoUrl
        }
        alt=""
        categoryName={categoryName}
        className="size-[60px] shrink-0 rounded-[8px]"
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          {/*
            The reference pins the name to `white-space: nowrap`, which works
            for its short English samples but silently breaks on real data:
            a long Ukrainian dish name pushed the price past the row's right
            edge, and the view's `overflow: hidden` then clipped it — a menu
            rendering no price at all. Measured at 390px: name ended at
            535px against a 348px row.

            So the name wraps instead. Short names are unaffected and still
            render exactly like the reference (natural width, long leader,
            price hard right); only a name that genuinely cannot fit now
            takes a second line rather than shoving the price out of sight.
          */}
          <span
            data-testid="modern-dish-name"
            style={{ fontSize: 14, fontWeight: 500, minWidth: 0, overflowWrap: "anywhere" }}
          >
            {item.name}
          </span>
          {/* Keeps a visible stub of leader even when the name eats the row. */}
          <span
            data-testid="modern-leader"
            style={{
              flex: "1 1 12px",
              minWidth: 12,
              borderBottom: `1px dotted ${MODERN_PALETTE.leader}`,
              transform: "translateY(-3px)",
            }}
          />
          {item.price !== undefined && (
            <span
              data-testid="modern-dish-price"
              style={{
                fontFamily: "var(--menu-heading-font)",
                fontSize: 15,
                color: MODERN_PALETTE.gold,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {item.price}
              {currency ? ` ${currency}` : ""}
            </span>
          )}
        </div>

        {item.description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 11.5,
              color: MODERN_PALETTE.textMuted,
              lineHeight: 1.5,
            }}
          >
            {item.description}
          </p>
        )}

        {badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {badges.map((badge) => (
              <ModernBadge key={badge} label={badge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
