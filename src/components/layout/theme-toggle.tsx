"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * A segmented control built on real radio inputs rather than buttons with ARIA —
 * arrow-key selection, form semantics and screen-reader grouping all come free.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5">
      <legend className="sr-only">Colour theme</legend>

      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          className={cn(
            "grid size-8 cursor-pointer place-items-center rounded-full transition-colors",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
            theme === value ? "bg-canvas-muted text-ink" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            className="sr-only"
          />
          <Icon className="size-4" aria-hidden />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
