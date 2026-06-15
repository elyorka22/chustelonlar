"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AnalyticsData } from "@/types";
import { cn } from "@/lib/utils";

type ChartMetric = "ads" | "users" | "views" | "all";

interface ChartCardProps {
  analytics: AnalyticsData;
}

function formatChartDate(date: string) {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function ChartCard({ analytics }: ChartCardProps) {
  const [metric, setMetric] = useState<ChartMetric>("all");

  const chartData = analytics.dailyGrowth.map((day, i) => ({
    date: formatChartDate(day.date),
    ads: day.count,
    users: analytics.userGrowth[i]?.count ?? 0,
    views: analytics.viewsGrowth[i]?.count ?? 0,
  }));

  const tabs: { id: ChartMetric; label: string }[] = [
    { id: "all", label: "Hammasi" },
    { id: "ads", label: "E'lonlar" },
    { id: "users", label: "Foydalanuvchilar" },
    { id: "views", label: "Ko'rishlar" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#0F172A]">O&apos;sish dinamikasi</h3>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMetric(tab.id)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
              metric === tab.id
                ? "bg-primary text-white"
                : "bg-[#F1F5F9] text-[#64748B]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 24px rgba(15,23,42,0.1)",
                fontSize: 12,
              }}
            />
            {metric === "all" && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {(metric === "all" || metric === "ads") && (
              <Line
                type="monotone"
                dataKey="ads"
                name="E'lonlar"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {(metric === "all" || metric === "users") && (
              <Line
                type="monotone"
                dataKey="users"
                name="Foydalanuvchilar"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
            {(metric === "all" || metric === "views") && (
              <Line
                type="monotone"
                dataKey="views"
                name="Ko'rishlar"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
