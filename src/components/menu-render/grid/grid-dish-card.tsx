import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { GridPalette } from "@/components/menu-render/grid/grid-palette";
import type { MenuItem } from "@/services/ai/schemas/menu-content";

const DIETARY = new Set(["vegetarian", "vegan", "gluten-free", "gluten free"]);

/** Shared by all three renderers so a badge never means one thing on the web and another in print. */
export function isDietaryBadge(badge: string): boolean {
  return DIETARY.has(badge.trim().toLowerCase());
}

export interface GridDishCardProps {
  item: MenuItem;
  categoryName: string;
  currency: string | undefined;
  showBadges: boolean;
  palette: GridPalette;
}

/**
 * One dish as a photo-led tile: image on top at a fixed 4:3, then name and
 * price on one line, description, badges.
 *
 * The photo is the whole point of this engine — Modern puts a 110px thumb
 * beside a text row, here the image is the tile's headline and the text is
 * the caption. That inversion is why `grid` is a separate engine rather
 * than a config flag on Modern.
 *
 * A missing photo therefore hurts far more than it does in Modern, where a
 * small square just goes flat. So the placeholder keeps the exact same 4:3
 * box (the grid must not go ragged) and fills it with the dish's
 * category-derived color — the same getDishPlaceholderColor every other
 * surface uses, so one dish without a photo reads as a deliberate color
 * block rather than a hole.
 */
export function GridDishCard({
  item,
  categoryName,
  currency,
  showBadges,
  palette,
}: GridDishCardProps) {
  const badges = showBadges ? (item.badges ?? []) : [];

  return (
    <div
      style={{
        backgroundColor: palette.card,
        border: `1px solid ${palette.cardBorder}`,
        borderRadius: 10,
        overflow: "hidden",
        breakInside: "avoid",
      }}
    >
      {item.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dishPhotoUrlForEngine(item.photoUrl, "grid")}
          alt=""
          style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            backgroundColor: getDishPlaceholderColor(categoryName),
          }}
        />
      )}

      <div style={{ padding: "10px 12px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: palette.text }}>{item.name}</span>
          {item.price !== undefined && (
            <span
              style={{
                fontFamily: "var(--menu-heading-font)",
                fontSize: 15,
                fontWeight: 700,
                color: palette.accent,
                whiteSpace: "nowrap",
              }}
            >
              {item.price}
              {currency ? ` ${currency}` : ""}
            </span>
          )}
        </div>

        {item.description && (
          <p style={{ fontSize: 12.5, lineHeight: 1.45, color: palette.textMuted, marginTop: 4 }}>
            {item.description}
          </p>
        )}

        {badges.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {badges.map((badge) => {
              const dietary = isDietaryBadge(badge);
              return (
                <span
                  key={badge}
                  style={{
                    fontSize: 10,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 4,
                    color: dietary ? palette.badgeVeg : palette.accent,
                    border: `1px solid ${dietary ? palette.badgeVegBorder : palette.accentBorder}`,
                  }}
                >
                  {badge}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
