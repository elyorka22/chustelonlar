"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  getChegirmaCategoryEmoji,
  getChegirmaCategoryLabel,
} from "@/lib/chegirma-constants";
import type { ChegirmaData } from "@/types";

function formatValidUntil(date: Date): string {
  return new Date(date).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
}

export function ChegirmaCard({
  item,
  index = 0,
}: {
  item: ChegirmaData;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Link href={`/chegirmalar/${item.id}`}>
        <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <div className="relative h-36 w-full bg-[#F1F5F9]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>

          <div className="px-3 pt-3">
            <span className="inline-block rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-extrabold text-white">
              {item.discountLabel}
            </span>
            <p className="mt-2 text-[12px] font-semibold text-primary">
              {getChegirmaCategoryEmoji(item.category)} {item.businessName}
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-[15px] font-extrabold leading-snug text-[#0F172A]">
              {item.title}
            </h3>
            <p className="sr-only">{getChegirmaCategoryLabel(item.category)}</p>
          </div>

          <div className="flex items-center justify-between px-3 py-2.5 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.district}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatValidUntil(item.validUntil)} gacha
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
