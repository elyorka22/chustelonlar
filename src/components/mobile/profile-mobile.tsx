"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Settings, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { StatsCard } from "@/components/mobile/stats-card";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
import { markAdSold, removeAd } from "@/lib/actions";
import { toast } from "sonner";
import type { AdWithImages } from "@/types";

interface ProfileMobileProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
    role: string;
  };
  ads: AdWithImages[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    sold: number;
    totalViews: number;
  };
}

const TABS = [
  { id: "ads", label: "E'lonlarim" },
  { id: "saved", label: "Saqlanganlar" },
  { id: "settings", label: "Sozlamalar" },
];

export function ProfileMobile({ user, ads, stats }: ProfileMobileProps) {
  const [activeTab, setActiveTab] = useState("ads");

  const handleMarkSold = async (adId: string) => {
    const result = await markAdSold(adId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Sotildi");
    window.location.reload();
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    const result = await removeAd(adId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("O'chirildi");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Profile header gradient */}
      <div className="relative bg-gradient-to-br from-primary to-blue-600 px-4 pb-8 pt-2 md:rounded-b-[24px]">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10" />
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Settings className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="mt-2 flex flex-col items-center">
          {user.image ? (
            <img src={user.image} alt="" className="h-20 w-20 rounded-full border-4 border-white/30 object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-2xl font-bold text-white">
              {user.name?.[0] || "?"}
            </div>
          )}
          <h1 className="mt-3 text-[20px] font-bold text-white">
            {user.name || "Foydalanuvchi"}
          </h1>
          <p className="text-[13px] text-white/70">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5 px-4 -mt-5">
        <StatsCard label="Mening e'lonlarim" value={stats.total} index={0} />
        <StatsCard label="Ko'rishlar" value={stats.totalViews} index={1} />
        <StatsCard label="Faol" value={stats.approved} index={2} />
      </div>

      {user.role === "ADMIN" && (
        <div className="mt-4 px-4">
          <Link href="/admin">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#0F172A] text-[15px] font-bold text-white shadow-lg shadow-black/15"
            >
              <Shield className="h-5 w-5" />
              Admin panel
            </motion.div>
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-2xl py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-primary card-shadow"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {activeTab === "ads" && (
          <div className="space-y-3">
            <Link
              href="/create"
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25"
            >
              <Plus className="h-5 w-5" />
              Yangi e&apos;lon
            </Link>

            {ads.length === 0 ? (
              <div className="rounded-[20px] bg-white py-12 text-center text-gray-500 card-shadow">
                Hali e&apos;lonlar yo&apos;q
              </div>
            ) : (
              ads.map((ad, i) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="overflow-hidden rounded-[20px] bg-white card-shadow"
                >
                  <Link href={`/ads/${ad.id}`} className="flex gap-3 p-3">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-secondary">
                      {ad.images[0] && (
                        <Image src={ad.images[0].thumbUrl} alt="" fill className="object-cover" sizes="80px" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-[14px] font-semibold">{ad.title}</h3>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${AD_STATUS_STYLES[ad.status]}`}>
                          {AD_STATUS_LABELS[ad.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] font-extrabold text-primary">
                        {formatPrice(ad.price)}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {ad.views} ko&apos;rish · {formatRelativeDate(ad.createdAt)}
                      </p>
                    </div>
                  </Link>
                  {ad.status === "APPROVED" && (
                    <div className="flex gap-2 border-t border-gray-50 px-3 py-2">
                      <button
                        onClick={() => handleMarkSold(ad.id)}
                        className="flex-1 rounded-xl bg-secondary py-2 text-[12px] font-semibold text-gray-700"
                      >
                        Sotildi
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="flex-1 rounded-xl bg-red-50 py-2 text-[12px] font-semibold text-red-600"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="rounded-[20px] bg-white py-12 text-center text-gray-500 card-shadow">
            Saqlangan e&apos;lonlar yo&apos;q
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-[20px] bg-white p-4 card-shadow"
            >
              <LogOut className="h-5 w-5 text-red-500" />
              <span className="text-[15px] font-semibold text-red-600">Chiqish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
