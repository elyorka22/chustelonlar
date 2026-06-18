"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Settings,
  Shield,
  Store,
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
  Pencil,
  Bell,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, formatRelativeDate, cn } from "@/lib/utils";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/lib/constants";
import { toast } from "sonner";
import { isActionError } from "@/lib/action-result";
import { switchToBusinessAccount } from "@/lib/actions";
import { dispatchWelcomeBonusCheck } from "@/lib/welcome-bonus-celebration";
import { ProfileSettings } from "@/components/mobile/profile-settings";
import { MonetkaWalletCard, CoinHistoryTable } from "@/components/mobile/monetka-wallet";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
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
  coinValueUzs: number;
  contact: {
    telegram: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
  businessRequired?: boolean;
}

const TABS = [
  { id: "ads", label: "E'lonlar" },
  { id: "wallet", label: "Monetka" },
  { id: "saved", label: "Saqlangan" },
  { id: "settings", label: "Sozlamalar" },
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
  coinValueUzs,
  contact,
  businessRequired = false,
}: ProfileMobileProps) {
  const stats = {
    total: dashboardStats.listings.total,
    approved: dashboardStats.listings.active,
    pending: ads.filter((a) => a.status === "PENDING").length,
    totalViews: dashboardStats.engagement.totalViews,
  };

  const [activeTab, setActiveTab] = useState<TabId>("ads");
  const [displayName, setDisplayName] = useState(user.name || "");
  const [savedAds, setSavedAds] = useState(favorites);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [upgradingBusiness, setUpgradingBusiness] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (businessRequired && user.role === "USER") {
      toast.info("Aksiya yaratish uchun biznes akkauntga o'ting");
    }
  }, [businessRequired, user.role]);

  const handleBecomeBusiness = async () => {
    setUpgradingBusiness(true);
    const result = await switchToBusinessAccount();
    setUpgradingBusiness(false);
    if (isActionError(result)) {
      toast.error(result.error);
      return;
    }
    toast.success("Biznes akkaunt faollashtirildi!");
    router.refresh();
    dispatchWelcomeBonusCheck();
  };

  const initials = (displayName || user.name || user.email)?.[0]?.toUpperCase() || "?";

  const telegramUrl = contact.telegram
    ? contact.telegram.startsWith("http")
      ? contact.telegram
      : `https://t.me/${contact.telegram.replace("@", "")}`
    : null;
  const whatsappUrl = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
    : null;

  const handleTopUp = () => {
    if (telegramUrl || whatsappUrl || contact.phone) {
      setTopUpOpen(true);
      return;
    }
    toast.info("Admin bilan bog'lanish uchun sozlamalar kutilmoqda");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/95 px-4 backdrop-blur-md">
        <div className="w-10" />
        <h1 className="text-[17px] font-extrabold text-[#0F172A]">Profil</h1>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl active:scale-95"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5 text-[#64748B]" />
        </button>
      </header>

      <div className="px-4 pt-2">
        {/* Blue profile card */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary via-blue-600 to-blue-700 p-5 text-white shadow-lg shadow-primary/25">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />

          <div className="relative flex items-start gap-4">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="h-[64px] w-[64px] shrink-0 rounded-[18px] object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[18px] bg-violet-500 text-2xl font-bold ring-2 ring-white/30">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[20px] font-extrabold">
                      {displayName || "Foydalanuvchi"}
                    </h2>
                    {user.role === "ADMIN" && (
                      <span className="rounded-md bg-[#0F172A] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                    {user.role === "MODERATOR" && (
                      <span className="rounded-md bg-[#8B5CF6] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                        Moderator
                      </span>
                    )}
                    {user.role === "BUSINESS" && (
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0F172A]">
                        Biznes
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-white/80">{user.email}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-white/60">
                    A&apos;zo: {formatMemberSince(user.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"
                  aria-label="Sozlamalar"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Wallet inline */}
          <div className="relative mt-5 rounded-[18px] bg-white/15 p-4 backdrop-blur-sm ring-1 ring-white/20">
            <div className="flex items-center gap-3">
              <MonetkaIcon size={36} />
              <div>
                <p className="text-[28px] font-black leading-none">{user.coinBalance}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-white/80">Monetka</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleTopUp}
                className="flex-1 rounded-xl bg-white py-2.5 text-[13px] font-bold text-primary active:scale-[0.98] transition-transform"
              >
                Hisobni to&apos;ldirish
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-[13px] font-bold text-white ring-1 ring-white/30 active:scale-[0.98] transition-transform"
              >
                Tarix
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "E'lonlar", value: stats.total, icon: FileText, bg: "bg-blue-50", color: "text-primary" },
            { label: "Faol", value: stats.approved, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
            { label: "Kutilmoqda", value: stats.pending, icon: Clock, bg: "bg-orange-50", color: "text-orange-500" },
            { label: "Ko'rishlar", value: stats.totalViews, icon: Eye, bg: "bg-violet-50", color: "text-violet-600" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center rounded-[16px] bg-white px-1 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.05)]"
              >
                <div className={cn("mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl", item.bg)}>
                  <Icon className={cn("h-4 w-4", item.color)} strokeWidth={2.2} />
                </div>
                <p className="text-[17px] font-extrabold leading-none text-[#0F172A]">{item.value}</p>
                <p className="mt-1 text-center text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {(user.role === "ADMIN" || user.role === "MODERATOR") && (
          <Link href="/admin" className="mt-3 block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex h-[48px] items-center justify-between rounded-[16px] bg-[#0F172A] px-4 text-white"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4" />
                <span className="text-[14px] font-bold">
                  {user.role === "ADMIN" ? "Admin panel" : "Moderator panel"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </motion.div>
          </Link>
        )}

        {user.role === "USER" && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={upgradingBusiness}
            onClick={handleBecomeBusiness}
            className="mt-3 flex h-[48px] w-full items-center justify-between rounded-[16px] bg-amber-500 px-4 text-[#0F172A] disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              <Store className="h-4 w-4" />
              <span className="text-[14px] font-bold">
                {upgradingBusiness ? "Faollashtirilmoqda..." : "Biznes akkauntga o'tish"}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#0F172A]/60" />
          </motion.button>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-20 mt-4 bg-[#F4F6FA]/95 px-4 py-2 backdrop-blur-md">
        <div className="flex gap-1 rounded-[14px] bg-white p-1 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 rounded-[10px] py-2.5 text-[12px] font-bold transition-all",
                  active ? "bg-primary text-white shadow-sm shadow-primary/25" : "text-[#64748B]"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3">
        {activeTab === "ads" && (
          <div className="space-y-3">
            <Link
              href="/create"
              className="flex h-[52px] items-center justify-center gap-2 rounded-[16px] bg-primary text-[15px] font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.99] transition-transform"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              Yangi e&apos;lon joylash
            </Link>

            {ads.length === 0 ? (
              <div className="rounded-[20px] bg-white px-6 py-14 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
                <FileText className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                <p className="mt-3 text-[15px] font-bold text-[#0F172A]">E&apos;lonlar yo&apos;q</p>
                <p className="mt-1 text-[13px] text-[#64748B]">
                  Birinchi e&apos;loningizni joylang
                </p>
              </div>
            ) : (
              ads.map((ad, i) => (
                <motion.article
                  key={ad.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 rounded-[18px] bg-white p-3 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
                >
                  <Link href={`/ads/${ad.id}`} className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[14px] bg-[#F1F5F9]">
                    {ad.images[0] ? (
                      <Image src={ad.images[0].thumbUrl} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#CBD5E1]">—</div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/ads/${ad.id}`}>
                      <h3 className="line-clamp-1 text-[15px] font-bold text-[#0F172A]">{ad.title}</h3>
                      <p className="mt-1 text-[16px] font-extrabold text-primary">
                        {formatPrice(ad.price, ad.priceCurrency, ad.priceNegotiable)}
                      </p>
                    </Link>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] font-medium text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {ad.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {ad._count?.favorites ?? 0}
                      </span>
                      <span>{formatRelativeDate(ad.createdAt)}</span>
                    </div>
                    <span
                      className={cn(
                        "mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                        AD_STATUS_STYLES[ad.status]
                      )}
                    >
                      {ad.isPaused && ad.status === "APPROVED" ? "Yashirin" : AD_STATUS_LABELS[ad.status]}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/ads/${ad.id}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F6FA] text-[#64748B] active:scale-95 transition-transform"
                    aria-label="Sozlamalar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
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

            <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
              <h2 className="text-[15px] font-extrabold text-[#0F172A]">E&apos;lon statistikasi</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Jami", value: dashboardStats.listings.total },
                  { label: "Faol", value: dashboardStats.listings.active },
                  { label: "Sotilgan", value: dashboardStats.listings.sold },
                  { label: "Muddati tugagan", value: dashboardStats.listings.expired },
                  { label: "Ko'rishlar", value: dashboardStats.engagement.totalViews, icon: Eye },
                  { label: "Saqlangan", value: dashboardStats.engagement.favoritesCount, icon: Heart },
                  { label: "Kontakt", value: dashboardStats.engagement.contactClicks, icon: MousePointerClick },
                  { label: "O'rtacha", value: dashboardStats.engagement.avgViewsPerListing, icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
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

            <div>
              <h2 className="mb-2 px-1 text-[15px] font-extrabold text-[#0F172A]">Tranzaksiyalar</h2>
              <CoinHistoryTable transactions={dashboardStats.transactions} />
            </div>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-3">
            {savedAds.length === 0 ? (
              <div className="rounded-[20px] bg-white px-6 py-14 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
                <Bookmark className="mx-auto h-10 w-10 text-[#CBD5E1]" />
                <p className="mt-3 text-[15px] font-bold text-[#0F172A]">Saqlanganlar yo&apos;q</p>
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

      {/* Top up modal */}
      {topUpOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 pb-8">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-xl">
            <h3 className="text-[16px] font-bold text-[#0F172A]">Hisobni to&apos;ldirish</h3>
            <p className="mt-2 text-[14px] text-[#64748B]">
              Monetka sotib olish uchun admin bilan bog&apos;laning
            </p>
            <div className="mt-4 space-y-2">
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0088cc] text-[14px] font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-[14px] font-bold text-white"
                >
                  WhatsApp
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-bold text-white"
                >
                  {contact.phone}
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setTopUpOpen(false)}
              className="mt-3 h-11 w-full rounded-2xl bg-[#F1F5F9] text-[14px] font-bold text-[#64748B]"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
