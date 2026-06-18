"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, MapPin, Clock, Trash2, Eye } from "lucide-react";
import { AdminHeader } from "./admin-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { moderateChegirma, adminDeleteChegirma } from "@/lib/actions";
import { getChegirmaCategoryLabel } from "@/lib/chegirma-constants";
import { useAsyncAction } from "@/lib/use-async-action";
import { cn } from "@/lib/utils";
import type { ChegirmaData } from "@/types";

interface AdminChegirmalarClientProps {
  items: ChegirmaData[];
  notificationCount: number;
}

const CHEGIRMA_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Faol",
  REJECTED: "Rad etilgan",
  EXPIRED: "Muddati tugagan",
};

const CHEGIRMA_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-[#F59E0B]/10 text-[#F59E0B]",
  APPROVED: "bg-[#22C55E]/10 text-[#22C55E]",
  REJECTED: "bg-[#EF4444]/10 text-[#EF4444]",
  EXPIRED: "bg-[#94A3B8]/10 text-[#64748B]",
};

const actionBtn =
  "flex h-11 items-center justify-center gap-1 rounded-2xl text-[12px] font-bold touch-manipulation active:scale-[0.97] transition-transform disabled:pointer-events-none disabled:opacity-50";

export function AdminChegirmalarClient({
  items: initialItems,
  notificationCount,
}: AdminChegirmalarClientProps) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState("pending");
  const { run, isLoading } = useAsyncAction();

  const filtered = useMemo(() => {
    if (tab === "pending") return items.filter((i) => i.status === "PENDING");
    if (tab === "approved") return items.filter((i) => i.status === "APPROVED");
    return items;
  }, [items, tab]);

  const handleModerate = (id: string, action: "approve" | "reject") => {
    run(`chegirma-${id}`, () => moderateChegirma(id, action), {
      successMessage: action === "approve" ? "Tasdiqlandi" : "Rad etildi",
      onSuccess: () => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: action === "approve" ? "APPROVED" : "REJECTED" }
              : item
          )
        );
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Aksiyani o'chirmoqchimisiz? U saytdan va xaritadan olib tashlanadi.")) return;
    run(`delete-chegirma-${id}`, () => adminDeleteChegirma(id), {
      successMessage: "Aksiya o'chirildi",
      onSuccess: () => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      },
    });
  };

  return (
    <>
      <AdminHeader notificationCount={notificationCount} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 px-4 pb-8"
      >
        <div className="pt-2">
          <h1 className="text-xl font-extrabold text-[#0F172A]">Aksiyalar</h1>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Moderatsiya va o&apos;chirish · {filtered.length} ta
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending" className="text-xs">Kutilmoqda</TabsTrigger>
            <TabsTrigger value="approved" className="text-xs">Faol</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">Barchasi</TabsTrigger>
          </TabsList>
        </Tabs>

        {filtered.length === 0 && (
          <div className="rounded-[22px] bg-white p-8 text-center text-[#64748B] shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
            Aksiyalar topilmadi
          </div>
        )}

        {filtered.map((item, index) => {
          const loading =
            isLoading(`chegirma-${item.id}`) || isLoading(`delete-chegirma-${item.id}`);
          const isPending = item.status === "PENDING";

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
            >
              <div className="relative h-32">
                <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="400px" />
                <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {item.discountLabel}
                </span>
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    CHEGIRMA_STATUS_STYLES[item.status] ?? "bg-gray-100 text-gray-700"
                  )}
                >
                  {CHEGIRMA_STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[12px] font-semibold text-primary">{item.businessName}</p>
                <h3 className="text-[15px] font-extrabold text-[#0F172A]">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-[#64748B]">{item.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.district}
                  </span>
                  <span>{getChegirmaCategoryLabel(item.category)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.validUntil).toLocaleDateString("uz-UZ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-[#F1F5F9] p-3">
                {isPending && (
                  <>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleModerate(item.id, "approve")}
                      className={cn(actionBtn, "bg-emerald-50 text-emerald-600")}
                    >
                      <Check className="h-4 w-4" />
                      Tasdiq
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleModerate(item.id, "reject")}
                      className={cn(actionBtn, "bg-rose-50 text-rose-600")}
                    >
                      <X className="h-4 w-4" />
                      Rad
                    </button>
                  </>
                )}
                <Link
                  href={`/chegirmalar/${item.id}`}
                  className={cn(actionBtn, "bg-[#F1F5F9] text-[#64748B]")}
                >
                  <Eye className="h-4 w-4" />
                  Ko&apos;rish
                </Link>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDelete(item.id)}
                  className={cn(actionBtn, "bg-[#EF4444]/10 text-[#EF4444]")}
                >
                  <Trash2 className="h-4 w-4" />
                  O&apos;chirish
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
