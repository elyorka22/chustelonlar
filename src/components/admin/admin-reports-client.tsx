"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { AdminHeader } from "./admin-header";
import { ReportCard } from "./report-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getReportStatus,
  isHighPriorityReport,
  type ReportStatus,
} from "@/lib/admin-mock";
import { isActionError } from "@/lib/action-result";
import {
  adminDeleteAd,
  adminResolveReport,
} from "@/lib/actions";
import { toast } from "sonner";

interface AdminReport {
  id: string;
  reason: string;
  createdAt: Date;
  ad: {
    id: string;
    title: string;
    images: { thumbUrl: string }[];
  };
  user: { name: string | null; email: string } | null;
}

interface AdminReportsClientProps {
  reports: AdminReport[];
  notificationCount: number;
}

export function AdminReportsClient({
  reports,
  notificationCount,
}: AdminReportsClientProps) {
  const [tab, setTab] = useState("all");
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const enriched = useMemo(() => {
    return reports
      .filter((r) => !resolvedIds.has(r.id))
      .map((report, i) => ({
        ...report,
        status: getReportStatus(report.id, i) as ReportStatus,
        highPriority: isHighPriorityReport(report.reason),
      }));
  }, [reports, resolvedIds]);

  const filtered = useMemo(() => {
    if (tab === "all") return enriched;
    return enriched.filter((r) => r.status === tab);
  }, [enriched, tab]);

  const handleResolve = (reportId: string) => {
    setLoadingId(reportId);
    startTransition(async () => {
      const result = await adminResolveReport(reportId);
      setLoadingId(null);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }
      setResolvedIds((prev) => new Set([...prev, reportId]));
      toast.success("Shikoyat yechildi");
    });
  };

  const handleDelete = (adId: string) => {
    setLoadingId(adId);
    startTransition(async () => {
      const result = await adminDeleteAd(adId);
      setLoadingId(null);
      if (isActionError(result)) {
        toast.error(result.error);
        return;
      }
      toast.success("E'lon o'chirildi");
      window.location.reload();
    });
  };

  const handleIgnore = (reportId: string) => {
    setResolvedIds((prev) => new Set([...prev, reportId]));
    toast.success("E'tiborsiz qoldirildi");
  };

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <h1 className="pt-2 text-xl font-extrabold text-[#0F172A]">
          Xabarlar / Reportlar
        </h1>
        <p className="mt-0.5 text-sm text-[#64748B]">{filtered.length} ta shikoyat</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="text-xs">Barchasi</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Yangi</TabsTrigger>
            <TabsTrigger value="reviewing" className="text-xs">Ko&apos;rib chiqilmoqda</TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">Yechilgan</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-[20px] bg-white py-16 text-center shadow-sm">
              <p className="text-4xl">🎉</p>
              <p className="mt-2 font-semibold text-[#0F172A]">Shikoyatlar yo&apos;q</p>
              <p className="text-sm text-[#64748B]">Platforma xavfsiz</p>
            </div>
          ) : (
            filtered.map((report, i) => (
              <ReportCard
                key={report.id}
                id={report.id}
                adId={report.ad.id}
                adTitle={report.ad.title}
                thumbUrl={report.ad.images[0]?.thumbUrl}
                reason={report.reason}
                reporter={report.user?.name || report.user?.email || "Anonim"}
                createdAt={report.createdAt}
                status={report.status}
                highPriority={report.highPriority}
                loading={loadingId === report.id || loadingId === report.ad.id}
                onResolve={handleResolve}
                onDeleteAd={handleDelete}
                onIgnore={handleIgnore}
                index={i}
              />
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}
