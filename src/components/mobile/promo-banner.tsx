"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 1,
    bg: "from-violet-500 to-purple-600",
    title: "Chustdagi eng yaxshi e'lonlar",
    subtitle: "Avtomobil, uy-joy, ish va boshqa",
    cta: "Ko'rish",
    href: "/ads",
    emoji: "🏠",
  },
  {
    id: 2,
    bg: "from-blue-500 to-indigo-600",
    title: "E'lon joylash — bepul",
    subtitle: "Bir necha daqiqada joylashtiring",
    cta: "Boshlash",
    href: "/create",
    emoji: "📣",
  },
  {
    id: 3,
    bg: "from-emerald-500 to-teal-600",
    title: "Xaritada qidiring",
    subtitle: "Yaqin atrofdagi e'lonlar",
    cta: "Xarita",
    href: "/map",
    emoji: "📍",
  },
];

export function PromoBanner() {
  const [active, setActive] = useState(0);
  const slide = SLIDES[active];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25 }}
          className={`relative overflow-hidden rounded-[22px] bg-gradient-to-br ${slide.bg} px-5 py-5 shadow-lg shadow-black/10`}
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
              {slide.cta} →
            </Link>
          </div>

          <div className="pointer-events-none absolute -bottom-2 -right-1 flex h-28 w-28 items-center justify-center text-[72px] drop-shadow-lg">
            {slide.emoji}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-3 flex gap-1.5">
        {SLIDES.map((s, i) => (
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
    </div>
  );
}
