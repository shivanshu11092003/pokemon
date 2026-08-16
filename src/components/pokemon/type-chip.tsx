import { TYPE_META, typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeChipProps {
  type: PokemonTypeName;
  size?: "sm" | "md";
  className?: string;
}

export function TypeChip({ type, size = "sm", className }: TypeChipProps) {
  const { label, Icon } = TYPE_META[type];

  return (
    <span
      style={typeStyle(type)}
      className={cn(
        "type-chip inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[13px]",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {label}
    </span>
  );
}
