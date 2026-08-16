"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { officialArtworkUrl, pixelSpriteUrl } from "@/lib/utils/sprites";

interface PokemonArtProps {
  id: number;
  name: string;
  /** Rendered size in CSS pixels; drives the srcset Next generates. */
  size: number;
  priority?: boolean;
  className?: string;
}

/**
 * Artwork is addressed by dex id, so a card can paint its image straight from the
 * list endpoint. The box is a fixed square regardless of load state, which is what
 * keeps cumulative layout shift at zero as a page of cards streams in.
 */
export function PokemonArt({ id, name, size, priority = false, className }: PokemonArtProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={failed ? pixelSpriteUrl(id) : officialArtworkUrl(id)}
      alt={`${name} official artwork`}
      width={size}
      height={size}
      priority={priority}
      loading={priority ? undefined : "lazy"}
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
}
