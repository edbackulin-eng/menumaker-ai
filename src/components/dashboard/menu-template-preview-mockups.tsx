import { getAccentColorHex } from "@/config/menu-style";
import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import type { ResolvedMenuStyle } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import { MenuStaticView } from "@/components/menu-render/menu-static-view";

export interface TemplatePreviewSpec {
  name: string;
  style: ResolvedMenuStyle;
}

export interface MenuTemplatePreviewMockupsProps {
  templates: TemplatePreviewSpec[];
}

// English, generic, and short on purpose — this shows a first-time visitor
// what their *own* menu will look like once they have one, in any of the 5
// interface languages, without inventing per-locale sample dish names for a
// purely decorative demo.
const SAMPLE_CONTENT: MenuContent = {
  currency: "$",
  categories: [
    {
      id: "sample-category",
      name: "Chef's specials",
      items: [
        {
          id: "sample-item-1",
          name: "Grilled salmon",
          price: 24,
          description: "Lemon butter sauce",
        },
        { id: "sample-item-2", name: "Truffle pasta", price: 18 },
      ],
    },
  ],
};

const PREVIEW_SOURCE_WIDTH = 420;
const PREVIEW_SCALE = 0.42;
const CARD_BORDER_WIDTH = 2;

function MockupCard({ name, style }: TemplatePreviewSpec) {
  const accentHex = getAccentColorHex(style.accentColorId);

  return (
    <div
      style={{ borderColor: accentHex, borderWidth: CARD_BORDER_WIDTH }}
      className="bg-surface w-32 shrink-0 overflow-hidden rounded-lg border sm:w-36"
    >
      <div className="bg-surface-secondary relative h-24 overflow-hidden sm:h-28">
        <div
          className="pointer-events-none absolute top-0 left-0 origin-top-left"
          style={{ width: PREVIEW_SOURCE_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
          aria-hidden="true"
        >
          <MenuStaticView content={SAMPLE_CONTENT} style={{ ...style, columns: 1 }} />
        </div>
      </div>
      <p className="text-caption text-foreground-secondary truncate px-2 py-1.5 text-center">
        {name}
      </p>
    </div>
  );
}

/** Shown in the "no menus yet" empty state — real template renders (same MenuStaticView every other preview in the app uses), not abstract placeholder bars, so a first-time visitor sees actual product quality instead of a gray sketch of it. */
export function MenuTemplatePreviewMockups({ templates }: MenuTemplatePreviewMockupsProps) {
  return (
    <div className={`flex items-end justify-center gap-3 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
      {templates.map((template) => (
        <MockupCard key={template.name} {...template} />
      ))}
    </div>
  );
}
