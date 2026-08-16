"use client";

import { LayoutGrid, Projector } from "lucide-react";
import type { ExplorerView } from "@/hooks/use-explorer-params";
import { cn } from "@/lib/utils/cn";

const OPTIONS: Array<{ value: ExplorerView; label: string; Icon: typeof LayoutGrid }> = [
  { value: "stage", label: "Spotlight", Icon: Projector },
  { value: "grid", label: "Grid", Icon: LayoutGrid },
];

export function ViewToggle({
  value,
  onChange,
}: {
  value: ExplorerView;
  onChange: (view: ExplorerView) => void;
}) {
  return (
    <fieldset className="raised inline-flex h-11 shrink-0 items-center gap-0.5 rounded-(--radius-control) border border-line bg-surface p-1">
      <legend className="sr-only">Browsing layout</legend>

      {OPTIONS.map(({ value: option, label, Icon }) => (
        <label
          key={option}
          className={cn(
            "flex h-full cursor-pointer items-center gap-1.5 rounded-[0.5rem] px-2.5 text-[13px] font-medium transition-colors duration-200",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
            value === option ? "bg-canvas-muted text-ink" : "text-ink-faint hover:text-ink-muted",
          )}
        >
          <input
            type="radio"
            name="explorer-view"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          <Icon className="size-4" aria-hidden />
          <span className="hidden lg:inline">{label}</span>
          <span className="sr-only lg:hidden">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
