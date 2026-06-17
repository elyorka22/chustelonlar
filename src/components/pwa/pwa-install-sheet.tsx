"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Plus, X, Smartphone, Zap, Bell } from "lucide-react";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PwaInstallSheetProps {
  open: boolean;
  onClose: () => void;
  variant: "ios" | "android";
  onConfirmInstall?: () => void;
  installing?: boolean;
}

const BENEFITS = [
  { icon: Zap, text: "Tezroq ochiladi" },
  { icon: Smartphone, text: "Telefonda ilova kabi" },
  { icon: Bell, text: "Bildirishnomalar olish" },
];

export function PwaInstallSheet({
  open,
  onClose,
  variant,
  onConfirmInstall,
  installing = false,
}: PwaInstallSheetProps) {
  const [mounted, setMounted] = useState(false);
  const isIos = variant === "ios";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-[401] mx-auto flex w-full max-w-lg flex-col",
              "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))]",
              "rounded-t-[28px] bg-[#F2F2F7] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pt-2.5 pb-1">
              <div className="h-1 w-9 rounded-full bg-[#C7C7CC]" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[14px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
                    <Image
                      src="/icons/icon-192.png"
                      alt={APP_NAME}
                      fill
                      className="object-cover"
                      sizes="58px"
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="text-[17px] font-bold leading-tight text-[#0F172A]">
                      {APP_NAME}
                    </h2>
                    <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#64748B]">
                      {APP_DESCRIPTION}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5E5EA] text-[#636366]"
                  aria-label="Yopish"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isIos ? (
                <div className="mt-5 overflow-hidden rounded-2xl bg-white">
                  <p className="border-b border-[#F1F5F9] px-4 py-3 text-[13px] font-semibold text-[#64748B]">
                    Safari orqali o&apos;rnatish
                  </p>
                  <ol className="divide-y divide-[#F1F5F9]">
                    <li className="flex items-center gap-3 px-4 py-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
                        1
                      </span>
                      <span className="flex flex-1 items-center gap-2 text-[14px] text-[#0F172A]">
                        Pastdagi
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#007AFF]/10">
                          <Share className="h-4 w-4 text-[#007AFF]" />
                        </span>
                        <strong>Ulashish</strong> tugmasini bosing
                      </span>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
                        2
                      </span>
                      <span className="flex flex-1 items-center gap-2 text-[14px] text-[#0F172A]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#34C759]/10">
                          <Plus className="h-4 w-4 text-[#34C759]" />
                        </span>
                        <strong>Bosh ekranga qo&apos;shish</strong> ni tanlang
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                <ul className="mt-5 space-y-2">
                  {BENEFITS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.text}
                        className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-[14px] font-medium text-[#0F172A]">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="shrink-0 space-y-2 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
              {isIos ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[50px] w-full rounded-[14px] bg-primary text-[16px] font-semibold text-white active:opacity-90"
                >
                  Tushundim
                </button>
              ) : (
                <button
                  type="button"
                  disabled={installing}
                  onClick={onConfirmInstall}
                  className="h-[50px] w-full rounded-[14px] bg-primary text-[16px] font-semibold text-white active:opacity-90 disabled:opacity-60"
                >
                  {installing ? "O'rnatilmoqda..." : "O'rnatish"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="h-[50px] w-full rounded-[14px] bg-white text-[16px] font-semibold text-[#007AFF]"
              >
                Keyinroq
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
