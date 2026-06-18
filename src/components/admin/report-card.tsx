"use client";

import Link from "next/link";
import { Eye, CheckCircle, Trash2, Ban } from "lucide-react";
import { formatRelativeDate, cn } from "@/lib/utils";
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

const actionBtn =
  "flex h-11 w-full flex-col items-center justify-center rounded-xl text-[10px] font-bold touch-manipulation active:scale-[0.97] transition-transform disabled:pointer-events-none disabled:opacity-50";

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
}: ReportCardProps) {
  return (
    <div
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
        <Link href={`/ads/${adId}`} className={cn(actionBtn, "bg-[#F1F5F9] text-[#64748B]")}>
          <Eye className="mb-0.5 h-4 w-4" />
          Ko&apos;rish
        </Link>
        <button
          type="button"
          disabled={loading || status === "resolved"}
          onClick={() => onResolve?.(id)}
          className={cn(actionBtn, "bg-[#22C55E]/10 text-[#22C55E]")}
        >
          <CheckCircle className="mb-0.5 h-4 w-4" />
          Yechish
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onDeleteAd?.(adId)}
          className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
        >
          <Trash2 className="mb-0.5 h-4 w-4" />
          O&apos;chirish
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onIgnore?.(id)}
          className={cn(actionBtn, "bg-[#F8FAFC] text-[#94A3B8]")}
        >
          <Ban className="mb-0.5 h-4 w-4" />
          E&apos;tiborsiz
        </button>
      </div>
    </div>
  );
}
