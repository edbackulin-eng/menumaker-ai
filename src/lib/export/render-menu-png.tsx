import "server-only";

import { renderClassicPng } from "@/lib/export/classic/render-classic-png";
import { renderModernPng } from "@/lib/export/modern/render-modern-png";
import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";
import type { ExportableMenu } from "@/services/export/load-menu";

/**
 * Which Satori render tree draws each layout engine.
 *
 * Exhaustive by construction (`Record<MenuLayoutEngine, ...>`): adding an
 * engine to the union breaks this file until an entry exists, and breaks
 * the DOM and react-pdf registries too. That is the guarantee an if-chain
 * could not give — its `else` would happily render a brand-new engine as
 * the classic tree and produce a PNG that silently disagrees with the web
 * page and the PDF.
 *
 * Every entry has the same `(menu) => Promise<Buffer>` signature, so this
 * file contains no per-engine setup: whatever an engine needs (fonts,
 * remote photos, a QR) it does inside its own renderer.
 */
const PNG_ENGINE_REGISTRY: Record<MenuLayoutEngine, (menu: ExportableMenu) => Promise<Buffer>> = {
  classic: renderClassicPng,
  "banner-two-column": renderModernPng,
};

/** The PNG export's single engine dispatch point. */
export function renderMenuPng(menu: ExportableMenu): Promise<Buffer> {
  return PNG_ENGINE_REGISTRY[menu.style.layoutEngine](menu);
}
