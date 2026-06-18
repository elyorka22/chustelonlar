"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { isActionError } from "@/lib/action-result";
import { toggleAdFavorite } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  adId: string;
  initialFavorited?: boolean;
  className?: string;
  iconClassName?: string;
  onChange?: (favorited: boolean) => void;
}

export function FavoriteButton({
  adId,
  initialFavorited = false,
  className,
  iconClassName,
  onChange,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Avval tizimga kiring");
      return;
    }

    setLoading(true);
    const result = await toggleAdFavorite(adId);
    setLoading(false);

    if (isActionError(result)) {
      toast.error(result.error);
      return;
    }

    if ("favorited" in result) {
      setFavorited(result.favorited);
      onChange?.(result.favorited);
      toast.success(result.favorited ? "Saqlanganlar" : "Olib tashlandi");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? "Saqlanganlardan olib tashlash" : "Saqlash"}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform active:scale-95 disabled:opacity-60",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          favorited ? "fill-red-500 text-red-500" : "text-gray-400",
          iconClassName
        )}
      />
    </button>
  );
}
