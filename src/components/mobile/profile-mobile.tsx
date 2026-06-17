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
  Heart,
  BarChart3,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, formatRelativeDate } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
import { markAdSold, removeAd } from "@/lib/actions";
import { toast } from "sonner";
import { ProfileSettings } from "@/components/mobile/profile-settings";
import { MonetkaWalletCard, CoinHistoryTable } from "@/components/mobile/monetka-wallet";
import { MonetkaBadge } from "@/components/ui/monetka-icon";
import { PromotionPanel } from "@/components/mobile/promotion-panel";
import { isPromotionActive } from "@/lib/promotions";
import { cn } from "@/lib/utils";
import type { AdWithImages, CategoryData, UserDashboardStats } from "@/types";
import { AdCardGrid } from "@/components/mobile/ad-card-grid";

interface ProfileMobileProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
    role: string;
    hasPassword: boolean;
    coinBalance: number;
  };
  ads: AdWithImages[];
  favorites: AdWithImages[];
  categories: CategoryData[];
  dashboardStats: UserDashboardStats;
  promotionCosts: { top: number; vip: number; urgent: number };
  coinValueUzs: number;
}

const TABS = [
  { id: "ads", label: "E'lonlar", icon: FileText },
  { id: "wallet", label: "Monetka", icon: BarChart3 },
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

export function ProfileMobile({
  user,
  ads,
  favorites,
  categories,
  dashboardStats,
  promotionCosts,
  coinValueUzs,
}: ProfileMobileProps) {
  const stats = {
    total: dashboardStats.listings.total,
    approved: dashboardStats.listings.active,
    pending: ads.filter((a) => a.status === "PENDING").length,
    sold: dashboardStats.listings.sold,
    totalViews: dashboardStats.engagement.totalViews,
  };
  const [activeTab, setActiveTab] = useState<TabId>("ads");
  const [displayName, setDisplayName] = useState(user.name || "");
  const [savedAds, setSavedAds] = useState(favorites);

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
    if (
      !confirm(
        "E'lonni o'chirmoqchimisiz? Rasmlar 24 soat ichida serverdan ham o'chiriladi."
      )
    ) {
      return;
    }
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
                <MonetkaBadge balance={user.coinBalance} />
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

            {savedAds.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("saved")}
                className="flex h-[48px] w-full items-center justify-between rounded-[16px] bg-white px-4 ring-1 ring-[#E2E8F0] active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-[#0F172A]">Saqlanganlar</p>
                    <p className="text-[11px] text-[#64748B]">{savedAds.length} ta e&apos;lon</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
              </button>
            )}

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
                        {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
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

                  <div className="flex gap-2 border-t border-[#F1F5F9] px-3.5 py-2.5">
                    {ad.status === "APPROVED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleMarkSold(ad.id)}
                          className="flex-1 rounded-xl bg-[#F8FAFC] py-2.5 text-[12px] font-bold text-[#475569] ring-1 ring-[#E2E8F0]"
                        >
                          Sotildi deb belgilash
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(ad.id)}
                      className={cn(
                        "rounded-xl bg-red-50 py-2.5 text-[12px] font-bold text-red-600 ring-1 ring-red-100",
                        ad.status === "APPROVED" ? "px-4" : "flex-1"
                      )}
                    >
                      O&apos;chirish
                    </button>
                  </div>
                  {ad.status === "APPROVED" && (
                    <div className="border-t border-[#F1F5F9] px-3.5 pb-3.5 pt-2">
                      <PromotionPanel
                        adId={ad.id}
                        costs={promotionCosts}
                        active={{
                          isTop: isPromotionActive(!!ad.isTop, ad.topUntil),
                          isVip: isPromotionActive(!!ad.isVip, ad.vipUntil),
                          isUrgent: isPromotionActive(!!ad.isUrgent, ad.urgentUntil),
                        }}
                      />
                    </div>
                  )}
                </motion.article>
              ))
            )}
          </div>
        )}

        {activeTab === "wallet" && (
          <div className="space-y-4">
            <MonetkaWalletCard
              balance={dashboardStats.wallet.coinBalance}
              totalPurchased={dashboardStats.wallet.totalCoinsPurchased}
              totalSpent={dashboardStats.wallet.totalCoinsSpent}
              coinValueUzs={coinValueUzs}
            />

            <div className="rounded-[20px] bg-white p-4 ring-1 ring-[#E2E8F0]">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">E&apos;lon statistikasi</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Jami", value: dashboardStats.listings.total },
                  { label: "Faol", value: dashboardStats.listings.active },
                  { label: "Sotilgan", value: dashboardStats.listings.sold },
                  { label: "Muddati tugagan", value: dashboardStats.listings.expired },
                  { label: "Ko'rishlar", value: dashboardStats.engagement.totalViews, icon: Eye },
                  { label: "Saqlangan", value: dashboardStats.engagement.favoritesCount, icon: Heart },
                  { label: "Kontakt bosish", value: dashboardStats.engagement.contactClicks, icon: MousePointerClick },
                  { label: "O'rtacha ko'rish", value: dashboardStats.engagement.avgViewsPerListing, icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E2E8F0]">
                      <div className="flex items-center gap-1">
                        {Icon && <Icon className="h-3 w-3 text-primary" />}
                        <p className="text-[10px] font-bold uppercase text-[#94A3B8]">{item.label}</p>
                      </div>
                      <p className="mt-1 text-[18px] font-extrabold text-[#0F172A]">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[20px] bg-white p-4 ring-1 ring-[#E2E8F0]">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">Monetka tahlili</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-rose-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-rose-600">Reklamaga</p>
                  <p className="text-[18px] font-extrabold text-rose-900">
                    -{dashboardStats.coins.spentOnPromotions}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-amber-700">Joylashga</p>
                  <p className="text-[18px] font-extrabold text-amber-900">
                    -{dashboardStats.coins.spentOnPublishing}
                  </p>
                </div>
              </div>
              {dashboardStats.topListing && (
                <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-3 ring-1 ring-emerald-100">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Eng muvaffaqiyatli</p>
                  <p className="mt-1 text-[14px] font-bold text-[#0F172A]">
                    {dashboardStats.topListing.title}
                  </p>
                  <p className="text-[12px] text-emerald-700">
                    {dashboardStats.topListing.views} ko&apos;rish
                  </p>
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-2 px-1 text-[15px] font-extrabold text-[#0F172A]">Tranzaksiyalar</h2>
              <CoinHistoryTable transactions={dashboardStats.transactions} />
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-[16px] font-bold text-[#0F172A]">Saqlangan e&apos;lonlar</h2>
                <p className="text-[12px] text-[#64748B]">{savedAds.length} ta e&apos;lon</p>
              </div>
            </div>

            {savedAds.length === 0 ? (
              <div className="rounded-[20px] bg-white px-6 py-14 text-center ring-1 ring-[#E2E8F0]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8FAFC]">
                  <Bookmark className="h-7 w-7 text-[#CBD5E1]" />
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">Saqlanganlar yo&apos;q</p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  Yoqtirgan e&apos;lonlaringiz shu yerda ko&apos;rinadi
                </p>
                <Link
                  href="/ads"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-[13px] font-bold text-white"
                >
                  E&apos;lonlarni ko&apos;rish
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {savedAds.map((ad, i) => (
                  <AdCardGrid
                    key={ad.id}
                    ad={ad}
                    categories={categories}
                    index={i}
                    favorited
                    onFavoriteChange={(adId, next) => {
                      if (!next) {
                        setSavedAds((current) => current.filter((item) => item.id !== adId));
                      }
                    }}
                  />
                ))}
              </div>
            )}
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
