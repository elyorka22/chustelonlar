"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { AdminHeader } from "./admin-header";
import { StatsCard } from "./stats-card";
import { ChartCard } from "./chart-card";
import { ADMIN_DATE_RANGES, calcGrowthPercent } from "@/lib/admin-mock";
import type { AnalyticsData } from "@/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface AdminDashboardClientProps {
  analytics: AnalyticsData;
  staffName: string;
  notificationCount: number;
  isAdmin: boolean;
}

export function AdminDashboardClient({
  analytics,
  staffName,
  notificationCount,
  isAdmin,
}: AdminDashboardClientProps) {
  const [dateRange, setDateRange] = useState("30d");

  const stats = isAdmin
    ? [
        {
          icon: Users,
          label: "Foydalanuvchilar",
          value: analytics.totalUsers,
          growth: calcGrowthPercent(analytics.userGrowth),
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
        },
        {
          icon: FileText,
          label: "Jami e'lonlar",
          value: analytics.totalAds,
          growth: calcGrowthPercent(analytics.dailyGrowth),
          iconBg: "bg-[#8B5CF6]/10",
          iconColor: "text-[#8B5CF6]",
        },
        {
          icon: Clock,
          label: "Kutilmoqda",
          value: analytics.pendingAds,
          growth: analytics.pendingAds > 0 ? 5 : -10,
          iconBg: "bg-[#F59E0B]/10",
          iconColor: "text-[#F59E0B]",
        },
        {
          icon: CheckCircle,
          label: "Tasdiqlangan",
          value: analytics.approvedAds,
          growth: calcGrowthPercent(analytics.dailyGrowth),
          iconBg: "bg-[#22C55E]/10",
          iconColor: "text-[#22C55E]",
        },
        {
          icon: XCircle,
          label: "Rad etilgan",
          value: analytics.rejectedAds,
          growth: -3,
          iconBg: "bg-[#EF4444]/10",
          iconColor: "text-[#EF4444]",
        },
        {
          icon: Eye,
          label: "Jami ko'rishlar",
          value: analytics.totalViews,
          growth: calcGrowthPercent(analytics.viewsGrowth),
          iconBg: "bg-[#06B6D4]/10",
          iconColor: "text-[#06B6D4]",
        },
      ]
    : [
        {
          icon: Clock,
          label: "Kutilmoqda",
          value: analytics.pendingAds,
          growth: analytics.pendingAds > 0 ? 5 : -10,
          iconBg: "bg-[#F59E0B]/10",
          iconColor: "text-[#F59E0B]",
        },
        {
          icon: CheckCircle,
          label: "Tasdiqlangan",
          value: analytics.approvedAds,
          growth: calcGrowthPercent(analytics.dailyGrowth),
          iconBg: "bg-[#22C55E]/10",
          iconColor: "text-[#22C55E]",
        },
        {
          icon: XCircle,
          label: "Rad etilgan",
          value: analytics.rejectedAds,
          growth: -3,
          iconBg: "bg-[#EF4444]/10",
          iconColor: "text-[#EF4444]",
        },
      ];

  const quickLinks = isAdmin
    ? [
        { href: "/admin/ads", label: "Moderatsiya", count: analytics.pendingAds },
        { href: "/admin/chegirmalar", label: "Chegirmalar" },
        { href: "/admin/users", label: "Foydalanuvchilar", count: analytics.totalUsers },
        { href: "/admin/analytics", label: "Statistika" },
        { href: "/admin/reports", label: "Shikoyatlar" },
      ]
    : [
        { href: "/admin/ads", label: "E'lon moderatsiyasi", count: analytics.pendingAds },
        { href: "/admin/chegirmalar", label: "Chegirmalar moderatsiyasi" },
        { href: "/admin/reports", label: "Shikoyatlar" },
      ];

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="px-4 pb-4"
      >
        <div className="pt-2">
          <h1 className="text-xl font-extrabold text-[#0F172A]">
            Xush kelibsiz, {staffName} 👋
          </h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            {isAdmin ? "Bugun platformani boshqaring" : "Kontent moderatsiyasini boshqaring"}
          </p>
        </div>

        {isAdmin && (
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {ADMIN_DATE_RANGES.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setDateRange(range.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  dateRange === range.id
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-white text-[#64748B] shadow-sm"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}

        <div className={`mt-4 grid gap-3 ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
          {stats.map((stat, i) => (
            <StatsCard key={stat.label} {...stat} index={i} />
          ))}
        </div>

        {isAdmin && (
          <div className="mt-4">
            <ChartCard analytics={analytics} />
          </div>
        )}

        <div className="mt-4 rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h3 className="mb-3 text-sm font-extrabold text-[#0F172A]">Tezkor kirish</h3>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-2xl px-3 py-3 transition-colors hover:bg-[#F8FAFC]"
              >
                <span className="text-sm font-semibold text-[#0F172A]">{link.label}</span>
                <div className="flex items-center gap-2">
                  {"count" in link && link.count !== undefined && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {link.count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-[#CBD5E1]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
