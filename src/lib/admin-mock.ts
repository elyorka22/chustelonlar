import type { AnalyticsData } from "@/types";

export type ReportStatus = "pending" | "reviewing" | "resolved";

export const ADMIN_DATE_RANGES = [
  { id: "7d", label: "7 kun" },
  { id: "30d", label: "30 kun" },
  { id: "90d", label: "90 kun" },
] as const;

export const DEFAULT_DISTRICT_STATS = [
  { district: "Chust Markaz", count: 0, percentage: 60 },
  { district: "Tepaqo'rg'on", count: 0, percentage: 20 },
  { district: "G'uporon", count: 0, percentage: 10 },
  { district: "Qayrimo", count: 0, percentage: 5 },
  { district: "Boshqalar", count: 0, percentage: 5 },
];

export function calcGrowthPercent(
  series: { date: string; count: number }[]
): number {
  if (series.length < 14) return 12;
  const recent = series.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev = series.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  if (prev === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prev) / prev) * 100);
}

export function enrichDistrictStats(
  stats: AnalyticsData["districtStats"]
): AnalyticsData["districtStats"] {
  if (stats.length >= 3) return stats;
  return DEFAULT_DISTRICT_STATS;
}

export function getReportStatus(
  reportId: string,
  index: number
): ReportStatus {
  const hash = reportId.charCodeAt(0) + index;
  if (hash % 5 === 0) return "resolved";
  if (hash % 3 === 0) return "reviewing";
  return "pending";
}

export function isHighPriorityReport(reason: string): boolean {
  const keywords = ["firibgar", "soxta", "xavf", "spam", "yolg'on"];
  const lower = reason.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}
