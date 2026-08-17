"use client";

import Image from "next/image";
import { memo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { officialArtworkUrl, pixelSpriteUrl } from "@/lib/utils/sprites";

interface PokemonArtProps {
  id: number;
  name: string;
  /** Rendered size in CSS pixels; drives the srcset Next generates. */
  size: number;
  priority?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
}

/**
 * Artwork is addressed by dex id, so a card can paint its image straight from the
 * list endpoint. The box is a fixed square regardless of load state, which is what
 * keeps cumulative layout shift at zero as a page of cards streams in.
 */
export const PokemonArt = memo(function PokemonArt({
  id,
  name,
  size,
  priority = false,
  loading,
  className,
}: PokemonArtProps) {
  const [failed, setFailed] = useState(false);

  const isEager = priority || loading === "eager";

  return (
    <Image
      src={failed ? pixelSpriteUrl(id) : officialArtworkUrl(id)}
      alt={`${name} official artwork`}
      width={size}
      height={size}
      priority={isEager}
      loading={isEager ? "eager" : "lazy"}
      decoding="async"
      unoptimized={failed}
      onError={() => setFailed(true)}
      className={cn(
        "select-none object-contain",
        failed && "[image-rendering:pixelated]",
        className,
      )}
      draggable={false}
    />
  );
});
