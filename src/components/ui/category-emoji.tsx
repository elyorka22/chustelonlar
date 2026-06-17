"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getEmoji3dUrl } from "@/lib/emoji-3d";

interface CategoryEmojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

export function CategoryEmoji({ emoji, size = 32, className }: CategoryEmojiProps) {
  const url = getEmoji3dUrl(emoji);
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <span className={cn("leading-none", className)} style={{ fontSize: size * 0.85 }}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt=""
      draggable={false}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("pointer-events-none select-none object-contain drop-shadow-sm", className)}
      style={{ width: size, height: size }}
    />
  );
}
