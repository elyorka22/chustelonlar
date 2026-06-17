"use client";

import { X, MessageCircle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MonetkaIcon } from "@/components/ui/monetka-icon";

interface InsufficientCoinsModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  required: number;
  contact: {
    telegram: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
}

export function InsufficientCoinsModal({
  open,
  onClose,
  balance,
  required,
  contact,
}: InsufficientCoinsModalProps) {
  const telegramUrl = contact.telegram
    ? contact.telegram.startsWith("http")
      ? contact.telegram
      : `https://t.me/${contact.telegram.replace("@", "")}`
    : null;
  const whatsappUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;
  const phoneUrl = contact.phone ? `tel:${contact.phone}` : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            className="fixed inset-x-4 top-1/2 z-[61] mx-auto max-w-sm -translate-y-1/2 rounded-[28px] bg-white p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <MonetkaIcon size={56} />
              <h2 className="mt-4 text-[18px] font-extrabold text-[#0F172A]">
                Hisobingizda monetka yetarli emas
              </h2>
              <div className="mt-4 w-full space-y-2 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#64748B]">Joriy balans</span>
                  <span className="font-extrabold text-amber-700">{balance} Monetka</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#64748B]">Kerak</span>
                  <span className="font-extrabold text-rose-600">{required} Monetka</span>
                </div>
              </div>

              <div className="mt-5 flex w-full flex-col gap-2">
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#0088cc] text-[14px] font-bold text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Admin bilan bog&apos;lanish
                  </a>
                )}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-[14px] font-bold text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                {phoneUrl && !telegramUrl && (
                  <a
                    href={phoneUrl}
                    className="flex h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-bold text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Qo&apos;ng&apos;iroq qilish
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[48px] rounded-2xl bg-[#F1F5F9] text-[14px] font-bold text-[#64748B]"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
