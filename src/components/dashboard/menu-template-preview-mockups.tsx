import { getAccentColorHex, type AccentColorId, type FontId } from "@/config/menu-style";
import {
  FONT_ID_TO_CSS_VARIABLE,
  MENU_EDITOR_FONT_VARIABLES_CLASSNAME,
} from "@/lib/fonts/menu-fonts";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";

interface MockupSpec {
  accentColorId: AccentColorId;
  fontId: FontId;
}

// Three deliberately distinct style pairings (not three shades of the same
// look) — this is a taste of the range of `menu_templates.config` output,
// not a specific template. Purely decorative bars, not real dish names: the
// point is "different visual styles exist," which doesn't need real text to
// land, and sidesteps inventing locale-specific sample content for a UI
// element that renders identically in all 5 interface languages.
const MOCKUPS: MockupSpec[] = [
  { accentColorId: "charcoal", fontId: "playfair-display" },
  { accentColorId: "sunset-orange", fontId: "oswald" },
  { accentColorId: "ocean-blue", fontId: "inter" },
];

function MockupCard({ accentColorId, fontId }: MockupSpec) {
  const accentHex = getAccentColorHex(accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const fontFamily = FONT_ID_TO_CSS_VARIABLE[fontId];

  return (
    <div className="border-border bg-surface w-20 shrink-0 overflow-hidden rounded-md border shadow-sm sm:w-24">
      <div
        className="flex h-7 items-center px-2"
        style={{ backgroundColor: accentHex, color: accentTextHex, fontFamily }}
      >
        <div className="h-1 w-1/2 rounded-full bg-current opacity-90" />
      </div>
      <div className="flex flex-col gap-1.5 p-2">
        {[0.9, 0.6, 0.75].map((width, i) => (
          <div
            key={i}
            className="bg-border h-1 rounded-full"
            style={{ width: `${width * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Shown in the "no menus yet" empty state — see EmptyState's `preview` prop. */
export function MenuTemplatePreviewMockups() {
  return (
    <div className={`flex items-end justify-center gap-3 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
      {MOCKUPS.map((spec, i) => (
        <MockupCard key={i} {...spec} />
      ))}
    </div>
  );
}
