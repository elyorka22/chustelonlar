"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Settings,
  Shield,
  Eye,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
import { markAdSold, removeAd } from "@/lib/actions";
import { toast } from "sonner";
import { ProfileSettings } from "@/components/mobile/profile-settings";
import { cn } from "@/lib/utils";
import type { AdWithImages } from "@/types";

interface ProfileMobileProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
    role: string;
    hasPassword: boolean;
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
  { id: "ads", label: "E'lonlar", icon: FileText },
  { id: "saved", label: "Saqlangan", icon: Bookmark },
  { id: "settings", label: "Sozlamalar", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

function formatMemberSince(date: Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function ProfileMobile({ user, ads, stats }: ProfileMobileProps) {
  const [activeTab, setActiveTab] = useState<TabId>("ads");
  const [displayName, setDisplayName] = useState(user.name || "");

  const handleMarkSold = async (adId: string) => {
    const result = await markAdSold(adId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Sotildi");
    window.location.reload();
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("O'chirmoqchimisiz?")) return;
    const result = await removeAd(adId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("O'chirildi");
    window.location.reload();
  };

  const initials = (displayName || user.name || user.email)?.[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Header card */}
      <div className="bg-white px-4 pb-5 pt-4 shadow-[0_1px_0_#E2E8F0]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="h-[72px] w-[72px] shrink-0 rounded-[22px] object-cover ring-4 ring-[#F1F5F9]"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary to-blue-600 text-2xl font-bold text-white ring-4 ring-[#F1F5F9]">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[20px] font-extrabold tracking-tight text-[#0F172A]">
                  {displayName || "Foydalanuvchi"}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="rounded-full bg-[#0F172A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[13px] text-[#64748B]">{user.email}</p>
              <p className="mt-1 text-[11px] font-medium text-[#94A3B8]">
                A&apos;zo: {formatMemberSince(user.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#64748B] ring-1 ring-[#E2E8F0] active:scale-95 transition-transform"
            aria-label="Sozlamalar"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-4 overflow-hidden rounded-[18px] bg-[#F8FAFC] ring-1 ring-[#E2E8F0]">
          {[
            { label: "E'lonlar", value: stats.total, icon: FileText },
            { label: "Faol", value: stats.approved, icon: CheckCircle2 },
            { label: "Kutilmoqda", value: stats.pending, icon: Clock },
            { label: "Ko'rishlar", value: stats.totalViews, icon: Eye },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col items-center px-2 py-3.5 text-center",
                  i > 0 && "border-l border-[#E2E8F0]"
                )}
              >
                <Icon className="mb-1 h-4 w-4 text-primary" strokeWidth={2.2} />
                <p className="text-[17px] font-extrabold leading-none text-[#0F172A]">
                  {item.value}
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {user.role === "ADMIN" && (
          <Link href="/admin" className="mt-4 block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex h-[48px] items-center justify-between rounded-[16px] bg-[#0F172A] px-4 text-white"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4" />
                <span className="text-[14px] font-bold">Admin panel</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </motion.div>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-1 rounded-[14px] bg-white p-1 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-[#E2E8F0]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2.5 text-[12px] font-bold transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "text-[#64748B]"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        {activeTab === "ads" && (
          <div className="space-y-3">
            <Link
              href="/create"
              className="flex h-[50px] items-center justify-center gap-2 rounded-[16px] bg-primary text-[14px] font-bold text-white shadow-md shadow-primary/20 active:scale-[0.99] transition-transform"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Yangi e&apos;lon joylash
            </Link>

            {ads.length === 0 ? (
              <div className="rounded-[20px] bg-white px-6 py-14 text-center ring-1 ring-[#E2E8F0]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC]">
                  <FileText className="h-7 w-7 text-[#CBD5E1]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">E&apos;lonlar yo&apos;q</p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  Birinchi e&apos;loningizni joylang va sotishni boshlang
                </p>
              </div>
            ) : (
              ads.map((ad, i) => (
                <motion.article
                  key={ad.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[#E2E8F0]"
                >
                  <Link href={`/ads/${ad.id}`} className="flex gap-3.5 p-3.5">
                    <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-[#F1F5F9]">
                      {ad.images[0] ? (
                        <Image
                          src={ad.images[0].thumbUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="88px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-[#CBD5E1]">
                          —
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#0F172A]">
                          {ad.title}
                        </h3>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                            AD_STATUS_STYLES[ad.status]
                          )}
                        >
                          {AD_STATUS_LABELS[ad.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-[16px] font-extrabold text-primary">
                        {formatPrice(ad.price)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {ad.views}
                        </span>
                        <span>{formatRelativeDate(ad.createdAt)}</span>
                      </div>
                    </div>
                  </Link>

                  {ad.status === "APPROVED" && (
                    <div className="flex gap-2 border-t border-[#F1F5F9] px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleMarkSold(ad.id)}
                        className="flex-1 rounded-xl bg-[#F8FAFC] py-2.5 text-[12px] font-bold text-[#475569] ring-1 ring-[#E2E8F0]"
                      >
                        Sotildi deb belgilash
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ad.id)}
                        className="rounded-xl bg-red-50 px-4 py-2.5 text-[12px] font-bold text-red-600 ring-1 ring-red-100"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  )}
                </motion.article>
              ))
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="rounded-[20px] bg-white px-6 py-14 text-center ring-1 ring-[#E2E8F0]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC]">
              <Bookmark className="h-7 w-7 text-[#CBD5E1]" />
            </div>
            <p className="text-[15px] font-bold text-[#0F172A]">Saqlanganlar yo&apos;q</p>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Yoqtirgan e&apos;lonlaringiz shu yerda ko&apos;rinadi
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <ProfileSettings
            user={{
              name: displayName,
              email: user.email,
              hasPassword: user.hasPassword,
            }}
            onProfileUpdated={setDisplayName}
          />
        )}
      </div>
    </div>
  );
}
