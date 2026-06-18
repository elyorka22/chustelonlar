"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { MiniMap } from "@/components/mobile/mobile-map-view";
import {
  getChegirmaCategoryEmoji,
  getChegirmaCategoryLabel,
} from "@/lib/chegirma-constants";
import type { ChegirmaData } from "@/types";

export function ChegirmaDetailMobile({ item }: { item: ChegirmaData }) {
  const validUntil = new Date(item.validUntil).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white pb-8">
      <MobileHeader title="Aksiya" showBack backHref="/chegirmalar" />

      <div className="w-full">
        <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto scrollbar-hide">
          {(item.imageUrls?.length ? item.imageUrls : [item.imageUrl]).map((src, i) => (
            <div key={src} className="relative h-52 w-full shrink-0 snap-center bg-[#F1F5F9]">
              <Image
                src={src}
                alt={item.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <span className="inline-block rounded-full bg-rose-500 px-3 py-1.5 text-[13px] font-extrabold text-white">
          {item.discountLabel}
        </span>
        <p className="mt-3 text-[13px] font-semibold text-primary">
          {getChegirmaCategoryEmoji(item.category)} {item.businessName}
        </p>
        <h1 className="mt-1 text-[22px] font-extrabold leading-snug text-gray-900">
          {item.title}
        </h1>
        <p className="mt-1 text-[12px] text-gray-500">
          {getChegirmaCategoryLabel(item.category)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-[12px] font-semibold text-orange-700">
            <Clock className="h-3.5 w-3.5" />
            {validUntil} gacha
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700">
            <MapPin className="h-3.5 w-3.5" />
            {item.district}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700">
          {item.description}
        </p>

        {item.address && (
          <p className="mt-3 text-[14px] text-gray-500">
            <MapPin className="mr-1 inline h-4 w-4" />
            {item.address}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={`tel:${item.phone}`}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-bold text-white"
          >
            <Phone className="h-4 w-4" />
            Qo&apos;ng&apos;iroq
          </a>
          {item.telegram ? (
            <a
              href={`https://t.me/${item.telegram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-500 text-[14px] font-bold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram
            </a>
          ) : (
            <Link
              href={`/map`}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary text-[14px] font-bold text-gray-700"
            >
              <MapPin className="h-4 w-4" />
              Xarita
            </Link>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[13px] font-semibold text-gray-700">Do&apos;kon joylashuvi</p>
          <MiniMap latitude={item.latitude} longitude={item.longitude} className="h-44 rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
