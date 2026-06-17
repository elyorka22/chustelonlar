"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { MapAdMarker } from "@/types";

interface MapCardProps {
  ad: MapAdMarker | null;
  onClose: () => void;
}

export function MapCard({ ad, onClose }: MapCardProps) {
  return (
    <AnimatePresence>
      {ad && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="absolute bottom-[calc(var(--nav-height)+12px)] left-3 right-3 z-[1000] md:bottom-4"
        >
          <Link href={`/ads/${ad.id}`}>
            <div className="flex items-center gap-3 rounded-[20px] bg-white p-3 card-shadow-lg">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary">
                {ad.thumbUrl ? (
                  <Image
                    src={ad.thumbUrl}
                    alt={ad.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">📍</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-bold text-gray-900">
                  {ad.title}
                </h3>
                <p className="text-[16px] font-extrabold text-primary">
                  {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
                </p>
                <p className="flex items-center gap-1 text-[12px] text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {ad.district}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
