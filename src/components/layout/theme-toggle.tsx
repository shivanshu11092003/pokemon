"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils/cn";

/**
 * A single theme toggle button that switches between light and dark modes.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-muted transition-all duration-200",
        "hover:border-line-strong hover:bg-canvas-muted hover:text-ink active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      )}
    >
      {isDark ? (
        <Sun className="size-4 transition-transform duration-300 hover:rotate-45" aria-hidden />
      ) : (
        <Moon className="size-4 transition-transform duration-300 hover:-rotate-12" aria-hidden />
      )}
    </button>
  );
}
