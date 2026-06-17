"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  getPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";
import { cn } from "@/lib/utils";

export function PushNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSupported(isPushSupported());

    if (!isPushSupported()) return;

    getPushSubscription()
      .then((sub) => setEnabled(!!sub))
      .catch(() => setEnabled(false));
  }, []);

  const handleToggle = () => {
    startTransition(async () => {
      if (enabled) {
        const result = await unsubscribeFromPush();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        setEnabled(false);
        toast.success("Bildirishnomalar o'chirildi");
        return;
      }

      const result = await subscribeToPush();
      if (!result.ok) {
        toast.error(result.error || "Xatolik yuz berdi");
        return;
      }
      setEnabled(true);
      toast.success("Bildirishnomalar yoqildi");
    });
  };

  if (!supported) {
    return (
      <section className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[#E2E8F0]">
        <div className="border-b border-[#F1F5F9] px-4 py-3.5">
          <h3 className="text-[14px] font-extrabold text-[#0F172A]">Bildirishnomalar</h3>
          <p className="mt-0.5 text-[12px] text-[#64748B]">
            Brauzeringiz push bildirishnomalarni qo&apos;llab-quvvatlamaydi
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[18px] bg-white ring-1 ring-[#E2E8F0]">
      <div className="border-b border-[#F1F5F9] px-4 py-3.5">
        <h3 className="text-[14px] font-extrabold text-[#0F172A]">Bildirishnomalar</h3>
        <p className="mt-0.5 text-[12px] text-[#64748B]">
          E&apos;lon tasdiqlanganda yoki rad etilganda xabar oling
        </p>
      </div>

      <div className="p-4">
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 ring-1 transition-colors active:scale-[0.99]",
            enabled
              ? "bg-primary/5 ring-primary/20"
              : "bg-[#F8FAFC] ring-[#E2E8F0]"
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              enabled ? "bg-primary/10" : "bg-white"
            )}
          >
            {enabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-[#64748B]" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-semibold text-[#0F172A]">Push bildirishnomalar</p>
            <p className="text-[11px] text-[#64748B]">
              {enabled ? "Yoqilgan" : "O'chirilgan"}
            </p>
          </div>
          <div
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors",
              enabled ? "bg-primary" : "bg-[#CBD5E1]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                enabled ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </div>
        </button>
      </div>
    </section>
  );
}
