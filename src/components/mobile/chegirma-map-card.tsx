"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MapChegirmaMarker } from "@/types";

interface ChegirmaMapCardProps {
  item: MapChegirmaMarker | null;
  onClose: () => void;
}

export function ChegirmaMapCard({ item, onClose }: ChegirmaMapCardProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="absolute bottom-[calc(var(--nav-height)+12px)] left-3 right-3 z-[1000] md:bottom-4"
        >
          <Link href={`/chegirmalar/${item.id}`}>
            <div className="flex items-center gap-3 rounded-[20px] bg-white p-3 card-shadow-lg">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={item.thumbUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {item.discountLabel}
                </span>
                <p className="mt-1 text-[11px] font-semibold text-[#64748B]">
                  {item.businessName}
                </p>
                <h3 className="truncate text-[14px] font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="flex items-center gap-1 text-[12px] text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {item.district}
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
