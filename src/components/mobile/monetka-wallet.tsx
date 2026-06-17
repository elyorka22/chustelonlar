"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import { cn } from "@/lib/utils";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("uz-UZ"));
  const [text, setText] = useState(value.toLocaleString("uz-UZ"));

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [value, spring, display]);

  return <span>{text}</span>;
}

interface MonetkaWalletCardProps {
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  coinValueUzs: number;
  className?: string;
}

export function MonetkaWalletCard({
  balance,
  totalPurchased,
  totalSpent,
  coinValueUzs,
  className,
}: MonetkaWalletCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] p-5",
        "bg-gradient-to-br from-amber-400/20 via-yellow-50 to-orange-100/40",
        "ring-1 ring-amber-200/60 backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-300/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-yellow-400/20 blur-xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70">
            Monetka hamyon
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <MonetkaIcon size={44} />
            </motion.div>
            <div>
              <p className="text-[32px] font-black leading-none tracking-tight text-amber-950">
                <AnimatedNumber value={balance} />
              </p>
              <p className="mt-1 text-[12px] font-semibold text-amber-800/80">
                ≈ {(balance * coinValueUzs).toLocaleString("uz-UZ")} so&apos;m
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/60 px-3 py-2.5 ring-1 ring-white/80">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Sotib olingan</p>
          <p className="mt-0.5 text-[18px] font-extrabold text-emerald-900">+{totalPurchased}</p>
        </div>
        <div className="rounded-2xl bg-white/60 px-3 py-2.5 ring-1 ring-white/80">
          <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">Sarflangan</p>
          <p className="mt-0.5 text-[18px] font-extrabold text-rose-900">-{totalSpent}</p>
        </div>
      </div>
    </div>
  );
}

interface CoinHistoryTableProps {
  transactions: {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: Date;
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  TOPUP: "To'ldirish",
  SPEND: "Sarflash",
  REFUND: "Qaytarish",
  BONUS: "Bonus",
  AD_PROMOTION: "Reklama",
};

export function CoinHistoryTable({ transactions }: CoinHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-[#64748B]">
        Tranzaksiyalar hozircha yo&apos;q
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[#E2E8F0]">
      <div className="grid grid-cols-[auto_1fr_auto] gap-2 border-b border-[#F1F5F9] bg-[#F8FAFC] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        <span>Sana</span>
        <span>Turi</span>
        <span className="text-right">Summa</span>
      </div>
      {transactions.map((tx) => {
        const positive = tx.amount > 0;
        return (
          <div
            key={tx.id}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-[#F8FAFC] px-3 py-3 last:border-0"
          >
            <span className="text-[11px] font-medium text-[#64748B]">
              {new Intl.DateTimeFormat("uz-UZ", {
                day: "2-digit",
                month: "short",
              }).format(new Date(tx.createdAt))}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-[#0F172A]">
                {TYPE_LABELS[tx.type] ?? tx.type}
              </p>
              {tx.description && (
                <p className="truncate text-[10px] text-[#94A3B8]">{tx.description}</p>
              )}
            </div>
            <span
              className={cn(
                "text-[13px] font-extrabold",
                positive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {positive ? "+" : ""}
              {tx.amount}
            </span>
          </div>
        );
      })}
    </div>
  );
}
