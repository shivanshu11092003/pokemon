/** Presentation-only formatters. No component may format a raw API value inline. */

/** `25` → `#0025`. Four digits keeps the National Dex monospaced past #1000. */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** `mr-mime` → `Mr Mime`, `ho-oh` → `Ho-Oh` (hyphen kept for real hyphenated names). */
const HYPHENATED_NAMES = new Set(["ho-oh", "porygon-z", "jangmo-o", "hakamo-o", "kommo-o"]);

const capitalise = (part: string) => part.charAt(0).toUpperCase() + part.slice(1);

export function toDisplayName(name: string): string {
  if (HYPHENATED_NAMES.has(name)) {
    return name.split("-").map(capitalise).join("-");
  }
  return name.split("-").map(capitalise).join(" ");
}

/** PokéAPI reports height in decimetres. */
export function formatHeight(decimetres: number): { metric: string; imperial: string } {
  const metres = decimetres / 10;
  const totalInches = metres * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return {
    metric: `${metres.toFixed(1)} m`,
    imperial: `${feet}′${String(inches).padStart(2, "0")}″`,
  };
}

/** PokéAPI reports weight in hectograms. */
export function formatWeight(hectograms: number): { metric: string; imperial: string } {
  const kilograms = hectograms / 10;
  return {
    metric: `${kilograms.toFixed(1)} kg`,
    imperial: `${(kilograms * 2.20462).toFixed(1)} lb`,
  };
}

export function formatStatLabel(key: string): string {
  switch (key) {
    case "hp":
      return "HP";
    case "special-attack":
      return "Sp. Atk";
    case "special-defense":
      return "Sp. Def";
    default:
      return toDisplayName(key);
  }
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
