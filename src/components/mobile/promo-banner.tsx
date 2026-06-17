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
          className={cn(
            "relative overflow-hidden rounded-[22px] bg-gradient-to-br px-5 py-5 shadow-lg shadow-black/10",
            slide.bgClass
          )}
        >
          <div className="relative z-10 max-w-[62%]">
            <p className="text-[18px] font-extrabold leading-snug text-white">
              {slide.title}
            </p>
            <p className="mt-1 text-[13px] font-medium text-white/80">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="mt-3 inline-flex rounded-full bg-white/20 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm"
            >
              {slide.ctaLabel} →
            </Link>
          </div>

          {slide.imageUrl ? (
            <div className="pointer-events-none absolute -bottom-1 right-0 h-28 w-28 overflow-hidden rounded-tl-2xl">
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                className="object-cover drop-shadow-lg"
                sizes="112px"
              />
            </div>
          ) : null}
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
