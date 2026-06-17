"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PromoBannerData } from "@/types";

interface PromoBannerProps {
  banners: PromoBannerData[];
}

export function PromoBanner({ banners }: PromoBannerProps) {
  const slides = banners.length > 0 ? banners : [];
  const [active, setActive] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[active] ?? slides[0];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className="relative min-h-[136px] overflow-hidden rounded-[22px] shadow-lg shadow-black/10"
        >
          {slide.imageUrl ? (
            <>
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                priority={active === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
            </>
          ) : (
            <div
              className={cn("absolute inset-0 bg-gradient-to-br", slide.bgClass)}
            />
          )}

          <div className="relative z-10 px-5 py-5">
            <p className="max-w-[75%] text-[18px] font-extrabold leading-snug text-white drop-shadow-sm">
              {slide.title}
            </p>
            <p className="mt-1 max-w-[75%] text-[13px] font-medium text-white/90 drop-shadow-sm">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-3 inline-flex rounded-full bg-white/20 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm"
            >
              {slide.ctaLabel} →
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="mt-3 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-gray-900" : "w-1.5 bg-gray-300"
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
