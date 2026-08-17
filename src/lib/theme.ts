/**
 * Theme contract shared by the server layout and the client toggle.
 *
 * The preference is stored in a cookie rather than localStorage precisely so the
 * server can read it and render the correct class into the HTML. That is what
 * removes the hydration mismatch: there is no pre-paint script mutating
 * `<html>` behind React's back, because the markup is already right.
 */

export const THEME_COOKIE = "pokedex-theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export function parseTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function themeClass(theme: Theme): string {
  return theme;
}
