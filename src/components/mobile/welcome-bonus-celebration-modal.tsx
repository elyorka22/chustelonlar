"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import {
  getWelcomeBonusCopy,
  type WelcomeBonusCelebration,
} from "@/lib/welcome-bonus-celebration";

interface WelcomeBonusCelebrationModalProps {
  open: boolean;
  celebration: WelcomeBonusCelebration | null;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#F59E0B", "#8B5CF6", "#22C55E", "#3B82F6", "#EF4444", "#EC4899"];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        delay: (i % 7) * 0.08,
        duration: 2.4 + (i % 5) * 0.2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 4) * 2,
        rotate: (i * 47) % 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{
            y: [0, 120, 280],
            opacity: [0, 1, 0],
            rotate: piece.rotate,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
          className="absolute rounded-sm"
          style={{
            left: piece.left,
            top: "8%",
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </div>
  );
}

export function WelcomeBonusCelebrationModal({
  open,
  celebration,
  onClose,
}: WelcomeBonusCelebrationModalProps) {
  if (!celebration) return null;

  const copy = getWelcomeBonusCopy(celebration.type, celebration.amount);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-sm -translate-y-1/2 overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            <div className="relative bg-gradient-to-b from-amber-50 via-white to-violet-50 px-6 pb-6 pt-8">
              <ConfettiBurst />

              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm"
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute -inset-3 rounded-full bg-amber-300/30 blur-xl" />
                  <MonetkaIcon size={72} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-5"
                >
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sovg&apos;a
                  </div>
                  <h2 className="text-[22px] font-extrabold leading-tight text-[#0F172A]">
                    {copy.title}
                  </h2>
                  <p className="mt-2 text-[15px] font-semibold leading-relaxed text-[#475569]">
                    {copy.subtitle}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-4 ring-1 ring-amber-200/80"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800/70">
                    Balansingizga qo&apos;shildi
                  </p>
                  <p className="mt-1 text-[36px] font-black leading-none text-amber-900">
                    +{celebration.amount}
                  </p>
                  <p className="mt-1 text-[13px] font-bold text-amber-800">Monetka</p>
                </motion.div>

                <p className="mt-4 text-[13px] leading-relaxed text-[#64748B]">{copy.hint}</p>

                <div className="mt-5 flex w-full flex-col gap-2">
                  <Link
                    href={copy.ctaHref}
                    onClick={onClose}
                    className="flex h-[48px] items-center justify-center rounded-2xl bg-primary text-[14px] font-bold text-white shadow-lg shadow-primary/25"
                  >
                    {copy.cta}
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-[44px] rounded-2xl bg-white/80 text-[13px] font-bold text-[#64748B] ring-1 ring-[#E2E8F0]"
                  >
                    Keyinroq
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
