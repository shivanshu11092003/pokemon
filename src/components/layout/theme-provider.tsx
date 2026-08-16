"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { THEME_COOKIE, THEME_MAX_AGE, type Theme, themeClass } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Seeded from the cookie the server already read, so the first client render
 * agrees with the server render by construction — no effect, no flash, no
 * mismatch. Changing the theme writes the cookie (for the next request) and
 * swaps the class immediately (for this one).
 */
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is Chromium-only; this has to work in Safari and Firefox
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_MAX_AGE}; samesite=lax`;

    // Post-hydration DOM writes are not diffed by React, so touching the class
    // list directly here is safe — and it is what makes the switch instant.
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    const className = themeClass(next);
    if (className) root.classList.add(className);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}
