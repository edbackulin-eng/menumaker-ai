import "server-only";

import { renderClassicPdf } from "@/lib/export/classic/render-classic-pdf";
import { renderGridPdf } from "@/lib/export/grid/render-grid-pdf";
import { renderModernPdf } from "@/lib/export/modern/render-modern-pdf";
import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";
import type { ExportableMenu } from "@/services/export/load-menu";

/**
 * Which @react-pdf/renderer tree draws each layout engine.
 *
 * Same exhaustive-Record contract as the DOM and Satori registries — see
 * PNG_ENGINE_REGISTRY's comment for why an if-chain was the wrong shape
 * here. Each entry owns its own font registration, photo fetching and QR
 * generation, because those differ per engine and react-pdf's font
 * registry is process-global and order-sensitive.
 */
const PDF_ENGINE_REGISTRY: Record<MenuLayoutEngine, (menu: ExportableMenu) => Promise<Buffer>> = {
  classic: renderClassicPdf,
  "banner-two-column": renderModernPdf,
  grid: renderGridPdf,
};

/** The PDF export's single engine dispatch point. */
export function renderMenuPdf(menu: ExportableMenu): Promise<Buffer> {
  return PDF_ENGINE_REGISTRY[menu.style.layoutEngine](menu);
}
