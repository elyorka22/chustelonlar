"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, CheckCircle, Trash2, Ban } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/admin-mock";

interface ReportCardProps {
  id: string;
  adId: string;
  adTitle: string;
  thumbUrl?: string;
  reason: string;
  reporter: string;
  createdAt: Date;
  status: ReportStatus;
  highPriority?: boolean;
  onResolve?: (id: string) => void;
  onDeleteAd?: (adId: string) => void;
  onIgnore?: (id: string) => void;
  loading?: boolean;
  index?: number;
}

const statusLabels: Record<ReportStatus, string> = {
  pending: "Yangi",
  reviewing: "Ko'rib chiqilmoqda",
  resolved: "Yechilgan",
};

const statusStyles: Record<ReportStatus, string> = {
  pending: "bg-[#F59E0B]/10 text-[#F59E0B]",
  reviewing: "bg-primary/10 text-primary",
  resolved: "bg-[#22C55E]/10 text-[#22C55E]",
};

export function ReportCard({
  id,
  adId,
  adTitle,
  thumbUrl,
  reason,
  reporter,
  createdAt,
  status,
  highPriority = false,
  onResolve,
  onDeleteAd,
  onIgnore,
  loading = false,
  index = 0,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        "overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
        highPriority && "ring-2 ring-[#EF4444]/30"
      )}
    >
      {highPriority && (
        <div className="bg-[#EF4444]/10 px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-[#EF4444]">
          Yuqori ustuvorlik
        </div>
      )}

      <div className="flex gap-3 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F1F5F9]">
          {thumbUrl ? (
            <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">📋</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-bold text-[#0F172A]">{adTitle}</p>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", statusStyles[status])}>
              {statusLabels[status]}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">{reason}</p>
          <p className="mt-1 text-[10px] text-[#94A3B8]">
            {reporter} · {formatRelativeDate(createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-[#F1F5F9] p-3">
        <Link href={`/ads/${adId}`}>
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex h-11 flex-col items-center justify-center rounded-xl bg-[#F1F5F9] text-[10px] font-bold text-[#64748B]"
          >
            <Eye className="mb-0.5 h-4 w-4" />
            Ko&apos;rish
          </motion.div>
        </Link>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={loading || status === "resolved"}
          onClick={() => onResolve?.(id)}
          className="flex h-11 flex-col items-center justify-center rounded-xl bg-[#22C55E]/10 text-[10px] font-bold text-[#22C55E] disabled:opacity-40"
        >
          <CheckCircle className="mb-0.5 h-4 w-4" />
          Yechish
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={() => onDeleteAd?.(adId)}
          className="flex h-11 flex-col items-center justify-center rounded-xl bg-[#EF4444]/10 text-[10px] font-bold text-[#EF4444]"
        >
          <Trash2 className="mb-0.5 h-4 w-4" />
          O&apos;chirish
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          onClick={() => onIgnore?.(id)}
          className="flex h-11 flex-col items-center justify-center rounded-xl bg-[#F8FAFC] text-[10px] font-bold text-[#94A3B8]"
        >
          <Ban className="mb-0.5 h-4 w-4" />
          E&apos;tiborsiz
        </motion.button>
      </div>
    </motion.div>
  );
}
