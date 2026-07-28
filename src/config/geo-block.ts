/**
 * Countries where account creation and sign-in are blocked (Stage 15.5,
 * PO legal decision after a real GDPR audit — see docs/privacy-audit.md).
 * Checked against Vercel's `x-vercel-ip-country` header — the same signal
 * `src/proxy.ts` already uses for Ukraine locale-priority, deliberately not
 * a second geo-IP mechanism.
 *
 * Four groups, each with its own legal basis — not one undifferentiated
 * "Europe" list:
 *
 * - EU_COUNTRIES: the 27 EU member states. GDPR applies directly.
 * - UK: `GB`. UK GDPR — a separate but equivalent post-Brexit regime.
 * - EEA_NON_EU_COUNTRIES: Norway, Iceland, Liechtenstein. Not EU members,
 *   but GDPR applies to them directly via the EEA agreement — the same
 *   law, not an analogous one.
 * - CH: Switzerland. Neither EU nor EEA — GDPR does not apply here as a
 *   matter of law; Switzerland has its own regime (nFADP/revLPD, in force
 *   since 2023). Included anyway on the PO's explicit instruction, for
 *   consistency rather than legal necessity: leaving one gap in an
 *   otherwise solid regional block was judged not worth the confusion for
 *   the handful of users it would reach.
 */
const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
] as const;

const UK = ["GB"] as const;

const EEA_NON_EU_COUNTRIES = ["NO", "IS", "LI"] as const;

const CH = ["CH"] as const;

export const EU_UK_COUNTRIES: ReadonlySet<string> = new Set([
  ...EU_COUNTRIES,
  ...UK,
  ...EEA_NON_EU_COUNTRIES,
  ...CH,
]);

export function isBlockedCountry(countryCode: string | null): boolean {
  return countryCode !== null && EU_UK_COUNTRIES.has(countryCode);
}
