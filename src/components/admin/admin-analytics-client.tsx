"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminHeader } from "./admin-header";
import { AnalyticsMap } from "./analytics-map";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgressBar } from "@/components/ui/progress";
import { enrichDistrictStats } from "@/lib/admin-mock";
import type { AnalyticsData, MapAdMarker } from "@/types";

interface AdminAnalyticsClientProps {
  analytics: AnalyticsData;
  mapAds: MapAdMarker[];
  notificationCount: number;
}

export function AdminAnalyticsClient({
  analytics,
  mapAds,
  notificationCount,
}: AdminAnalyticsClientProps) {
  const [tab, setTab] = useState("heatmap");
  const districts = enrichDistrictStats(analytics.districtStats);

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
          Statistika / Xarita
        </h1>
        <p className="mt-0.5 text-sm text-[#64748B]">
          E&apos;lonlar zichligi va hot zonalar
        </p>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="heatmap" className="text-xs">Heatmap</TabsTrigger>
            <TabsTrigger value="ads" className="text-xs">E&apos;lonlar</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <AnalyticsMap ads={mapAds} mode={tab as "heatmap" | "ads"} />
        </div>

        <div className="mt-4 rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 text-sm font-extrabold text-[#0F172A]">
            Top hududlar
          </h3>
          <div className="space-y-4">
            {districts.slice(0, 5).map((area, i) => (
              <motion.div
                key={area.district}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {i + 1}. {area.district}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {area.percentage}%
                  </span>
                </div>
                <ProgressBar value={area.percentage} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#64748B]">Hot zona</p>
            <p className="mt-1 text-lg font-extrabold text-[#22C55E]">
              {districts[0]?.district || "Chust Markaz"}
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#64748B]">Dead zona</p>
            <p className="mt-1 text-lg font-extrabold text-[#EF4444]">
              {districts[districts.length - 1]?.district || "Boshqalar"}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
