"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Minus, Coins, Save, Loader2, Gift, Store } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { MonetkaIcon } from "@/components/ui/monetka-icon";
import {
  adminAdjustCoins,
  adminSearchUsers,
  adminUpdateMonetizationSettings,
  adminUpdateCategoryPricing,
  adminDistributeUserWelcomeBonuses,
  adminDistributeBusinessWelcomeBonuses,
} from "@/lib/actions";
import { useAsyncAction } from "@/lib/use-async-action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { describeCategoryPricing } from "@/lib/category-pricing";
import type { CategoryData } from "@/types";
import type { MonetizationSettings } from "@prisma/client";

interface AdminMonetizationClientProps {
  settings: MonetizationSettings;
  categories: CategoryData[];
  notificationCount: number;
}

type SearchedUser = {
  id: string;
  name: string | null;
  email: string;
  coinBalance: number;
  totalCoinsPurchased: number;
  totalCoinsSpent: number;
  role: string;
};

const PRICING_TYPES = [
  { value: "FREE", label: "Bepul" },
  { value: "LIMITED_FREE", label: "Cheklangan bepul" },
  { value: "PAID", label: "Pullik" },
] as const;

export function AdminMonetizationClient({
  settings: initialSettings,
  categories: initialCategories,
  notificationCount,
}: AdminMonetizationClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [coinAmount, setCoinAmount] = useState("10");
  const [coinNote, setCoinNote] = useState("");
  const { run, isLoading } = useAsyncAction();

  const handleSaveSettings = () => {
    run("save-settings", () =>
      adminUpdateMonetizationSettings({
        coinValueUzs: settings.coinValueUzs,
        topPromotionCost: settings.topPromotionCost,
        vipPromotionCost: settings.vipPromotionCost,
        urgentPromotionCost: settings.urgentPromotionCost,
        autoCategoryCost: settings.autoCategoryCost,
        houseSaleCategoryCost: settings.houseSaleCategoryCost,
        rentCategoryCost: settings.rentCategoryCost,
        jobCategoryCost: settings.jobCategoryCost,
        freeListingsLimit: settings.freeListingsLimit,
        topDurationDays: settings.topDurationDays,
        vipDurationDays: settings.vipDurationDays,
        urgentDurationDays: settings.urgentDurationDays,
        contactTelegram: settings.contactTelegram ?? undefined,
        contactPhone: settings.contactPhone ?? undefined,
        contactWhatsapp: settings.contactWhatsapp ?? undefined,
        newUserWelcomeBonus: settings.newUserWelcomeBonus,
        newBusinessWelcomeBonus: settings.newBusinessWelcomeBonus,
      }),
      { successMessage: "Sozlamalar saqlandi" }
    );
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    run("search-users", () => adminSearchUsers(searchQuery), {
      onSuccess: (result) => {
        setUsers((result as { users?: SearchedUser[] }).users ?? []);
      },
    });
  };

  const handleAdjustCoins = (sign: 1 | -1) => {
    if (!selectedUser) return;
    const amount = parseInt(coinAmount, 10) * sign;
    if (!amount || Number.isNaN(amount)) {
      toast.error("Summani kiriting");
      return;
    }

    run("adjust-coins", () =>
      adminAdjustCoins(
        selectedUser.id,
        amount,
        sign > 0 ? "TOPUP" : "SPEND",
        coinNote || undefined
      ),
      {
        successMessage: "Balans yangilandi",
        onSuccess: (result) => {
          const balance = (result as { coinBalance?: number }).coinBalance;
          setSelectedUser((u) =>
            u ? { ...u, coinBalance: balance ?? u.coinBalance } : u
          );
          setUsers((list) =>
            list.map((u) =>
              u.id === selectedUser.id
                ? { ...u, coinBalance: balance ?? u.coinBalance }
                : u
            )
          );
        },
      }
    );
  };

  const handleDistributeUserBonuses = () => {
    run("distribute-user", () => adminDistributeUserWelcomeBonuses(), {
      onSuccess: (result) => {
        const count = (result as { count?: number }).count ?? 0;
        toast.success(`${count} ta yangi foydalanuvchiga bonus berildi`);
      },
    });
  };

  const handleDistributeBusinessBonuses = () => {
    run("distribute-business", () => adminDistributeBusinessWelcomeBonuses(), {
      onSuccess: (result) => {
        const count = (result as { count?: number }).count ?? 0;
        toast.success(`${count} ta biznes akkauntga bonus berildi`);
      },
    });
  };

  const handleCategoryPricing = (slug: string, field: string, value: string | number) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, [field]: value } : c))
    );
  };

  const saveCategoryPricing = (cat: CategoryData) => {
    run(`category-${cat.slug}`, () =>
      adminUpdateCategoryPricing(cat.slug, {
        pricingType: cat.pricingType ?? "FREE",
        listingCoinCost: cat.listingCoinCost ?? 0,
        freeLimit: cat.freeLimit ?? 0,
      }),
      { successMessage: `${cat.label} saqlandi` }
    );
  };

  const numInput = (
    label: string,
    key: keyof MonetizationSettings,
    suffix?: string
  ) => (
    <label className="block">
      <span className="text-[12px] font-semibold text-[#64748B]">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          value={settings[key] as number}
          onChange={(e) =>
            setSettings((s) => ({ ...s, [key]: parseInt(e.target.value, 10) || 0 }))
          }
          className="h-11 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] font-bold outline-none ring-1 ring-[#E2E8F0] focus:ring-primary/30"
        />
        {suffix && <span className="shrink-0 text-[12px] text-[#94A3B8]">{suffix}</span>}
      </div>
    </label>
  );

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 px-4 pb-8"
      >
        <div className="flex items-center gap-3 pt-2">
          <MonetkaIcon size={40} />
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A]">Monetka</h1>
            <p className="text-sm text-[#64748B]">Monetizatsiya va balans boshqaruvi</p>
          </div>
        </div>

        {/* Global settings */}
        <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-[#0F172A]">
            <Coins className="h-4 w-4 text-amber-500" />
            Global sozlamalar
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {numInput("1 Monetka = UZS", "coinValueUzs", "so'm")}
            {numInput("TOP narxi", "topPromotionCost", "monetka")}
            {numInput("VIP narxi", "vipPromotionCost", "monetka")}
            {numInput("Shoshilinch narxi", "urgentPromotionCost", "monetka")}
            {numInput("Avto (standart)", "autoCategoryCost", "monetka")}
            {numInput("Uy sotish (standart)", "houseSaleCategoryCost", "monetka")}
            {numInput("Ijara (standart)", "rentCategoryCost", "monetka")}
            {numInput("Ish e'lonlari (standart)", "jobCategoryCost", "monetka")}
            {numInput("Bepul limit (standart)", "freeListingsLimit", "ta")}
            {numInput("TOP davomiyligi", "topDurationDays", "kun")}
            {numInput("VIP davomiyligi", "vipDurationDays", "kun")}
            {numInput("Shoshilinch davomiyligi", "urgentDurationDays", "kun")}
          </div>

          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-100">
            Standart narxlar faqat kategoriyada narx <strong>0</strong> bo&apos;lganda qo&apos;llaniladi.
            Har bir kategoriya uchun pastdagi sozlamalar ustunlik qiladi.
          </p>

          <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-[#94A3B8]">
            Admin kontakt (yetarli monetka yo&apos;q modal)
          </p>
          <div className="mt-2 space-y-2">
            {(["contactTelegram", "contactPhone", "contactWhatsapp"] as const).map((key) => (
              <input
                key={key}
                value={settings[key] ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                placeholder={
                  key === "contactTelegram"
                    ? "@username yoki t.me/..."
                    : key === "contactPhone"
                      ? "+998..."
                      : "998..."
                }
                className="h-11 w-full rounded-xl bg-[#F8FAFC] px-3 text-[14px] outline-none ring-1 ring-[#E2E8F0]"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isLoading("save-settings")}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-bold text-white touch-manipulation disabled:opacity-50"
          >
            {isLoading("save-settings") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Saqlash
          </button>
        </section>

        {/* Audience welcome bonuses */}
        <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-[#0F172A]">
            <Gift className="h-4 w-4 text-violet-500" />
            Auditoriya bonuslari
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-[#64748B]">
            Yangi foydalanuvchilar ro&apos;yxatdan o&apos;tganda yoki kirganda avtomatik bonus oladi.
            Biznes akkauntga o&apos;tganlar alohida biznes bonusini oladi (bir marta).
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {numInput("Yangi foydalanuvchi", "newUserWelcomeBonus", "monetka")}
            {numInput("Yangi biznes", "newBusinessWelcomeBonus", "monetka")}
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isLoading("save-settings")}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary/10 text-[13px] font-bold text-primary touch-manipulation disabled:opacity-50"
          >
            {isLoading("save-settings") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Bonus summalarini saqlash
          </button>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleDistributeUserBonuses}
              disabled={isLoading("distribute-user")}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-500 text-[13px] font-bold text-white touch-manipulation disabled:opacity-50"
            >
              {isLoading("distribute-user") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Yangi foydalanuvchilarga tarqatish
            </button>
            <button
              type="button"
              onClick={handleDistributeBusinessBonuses}
              disabled={isLoading("distribute-business")}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 text-[13px] font-bold text-[#0F172A] touch-manipulation disabled:opacity-50"
            >
              {isLoading("distribute-business") ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
              Biznes akkauntlarga tarqatish
            </button>
          </div>
          <p className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-[11px] leading-relaxed text-violet-900 ring-1 ring-violet-100">
            Tarqatish faqat hali bonus olmagan foydalanuvchilarga beriladi (oldingi ro&apos;yxatdan
            o&apos;tganlar uchun qo&apos;lda ishga tushirish).
          </p>
        </section>

        {/* User coin management */}
        <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h2 className="text-[15px] font-extrabold text-[#0F172A]">Foydalanuvchi balansi</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Email yoki ism..."
              className="h-11 flex-1 rounded-xl bg-[#F8FAFC] px-3 text-[14px] outline-none ring-1 ring-[#E2E8F0]"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading("search-users")}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white touch-manipulation disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {users.length > 0 && (
            <div className="mt-3 space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left ring-1 transition-colors",
                    selectedUser?.id === u.id
                      ? "bg-amber-50 ring-amber-300"
                      : "bg-[#F8FAFC] ring-[#E2E8F0]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-[#0F172A]">
                      {u.name || u.email}
                    </p>
                    <p className="truncate text-[11px] text-[#64748B]">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MonetkaIcon size={18} showShine={false} />
                    <span className="text-[15px] font-extrabold text-amber-800">{u.coinBalance}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 ring-1 ring-amber-200">
              <p className="text-[13px] font-bold text-amber-900">
                {selectedUser.name || selectedUser.email}
              </p>
              <p className="mt-1 text-[24px] font-black text-amber-950">
                {selectedUser.coinBalance} Monetka
              </p>
              <p className="mt-1 text-[11px] text-amber-800">
                Sotib olingan: {selectedUser.totalCoinsPurchased} · Sarflangan:{" "}
                {selectedUser.totalCoinsSpent}
              </p>
              <input
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                className="mt-3 h-11 w-full rounded-xl bg-white px-3 text-[14px] font-bold outline-none ring-1 ring-amber-200"
                placeholder="Summa"
              />
              <input
                value={coinNote}
                onChange={(e) => setCoinNote(e.target.value)}
                className="mt-2 h-11 w-full rounded-xl bg-white px-3 text-[14px] outline-none ring-1 ring-amber-200"
                placeholder="Izoh (ixtiyoriy)"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustCoins(1)}
                  disabled={isLoading("adjust-coins")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 py-3 text-[13px] font-bold text-white touch-manipulation disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Qo&apos;shish
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustCoins(-1)}
                  disabled={isLoading("adjust-coins")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-rose-500 py-3 text-[13px] font-bold text-white touch-manipulation disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" /> Ayirish
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Category pricing */}
        <section className="rounded-[22px] bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
          <h2 className="text-[15px] font-extrabold text-[#0F172A]">Kategoriya narxlari</h2>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Asosiy sozlama shu yerda. Global standart narxlar faqat fallback sifatida ishlaydi.
          </p>
          <div className="mt-3 space-y-3">
            {categories.map((cat) => {
              const effective = describeCategoryPricing(
                {
                  slug: cat.slug,
                  pricingType: cat.pricingType ?? "FREE",
                  listingCoinCost: cat.listingCoinCost ?? 0,
                  freeLimit: cat.freeLimit ?? 0,
                },
                settings
              );

              return (
              <div key={cat.slug} className="rounded-xl bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14px] font-bold text-[#0F172A]">{cat.label}</p>
                  <p className="shrink-0 text-[11px] font-semibold text-primary">
                    {effective.pricingType === "FREE"
                      ? "Bepul"
                      : effective.pricingType === "LIMITED_FREE"
                        ? `${effective.freeLimit} ta bepul, keyin ${effective.listingCost} monetka`
                        : `${effective.listingCost} monetka`}
                  </p>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    value={cat.pricingType ?? "FREE"}
                    onChange={(e) =>
                      handleCategoryPricing(cat.slug, "pricingType", e.target.value)
                    }
                    className="h-10 rounded-lg bg-white px-2 text-[12px] font-semibold outline-none ring-1 ring-[#E2E8F0]"
                  >
                    {PRICING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={cat.listingCoinCost ?? 0}
                    onChange={(e) =>
                      handleCategoryPricing(
                        cat.slug,
                        "listingCoinCost",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    placeholder="Narx"
                    disabled={(cat.pricingType ?? "FREE") === "FREE"}
                    className="h-10 rounded-lg bg-white px-2 text-[12px] font-bold outline-none ring-1 ring-[#E2E8F0] disabled:opacity-50"
                  />
                  <input
                    type="number"
                    value={cat.freeLimit ?? 0}
                    onChange={(e) =>
                      handleCategoryPricing(
                        cat.slug,
                        "freeLimit",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    placeholder="Limit"
                    disabled={(cat.pricingType ?? "FREE") !== "LIMITED_FREE"}
                    className="h-10 rounded-lg bg-white px-2 text-[12px] font-bold outline-none ring-1 ring-[#E2E8F0] disabled:opacity-50"
                  />
                </div>
                {(cat.pricingType ?? "FREE") !== "FREE" && (
                  <p className="mt-2 text-[11px] text-[#64748B]">
                    {effective.usesGlobalCost && effective.pricingType !== "FREE"
                      ? "Narx 0 — standart global narx ishlatiladi. "
                      : ""}
                    {effective.usesGlobalLimit && effective.pricingType === "LIMITED_FREE"
                      ? `Limit 0 — global limit (${settings.freeListingsLimit} ta) ishlatiladi.`
                      : ""}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => saveCategoryPricing(cat)}
                  disabled={isLoading(`category-${cat.slug}`)}
                  className="mt-2 text-[12px] font-bold text-primary touch-manipulation disabled:opacity-50"
                >
                  Saqlash
                </button>
              </div>
            );
            })}
          </div>
        </section>
      </motion.div>
    </>
  );
}
