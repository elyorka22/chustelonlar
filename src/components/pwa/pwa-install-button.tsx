"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus, Share, X } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHintOpen, setIosHintOpen] = useState(false);
  const [showIosButton, setShowIosButton] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) {
      setInstalled(true);
      return;
    }

    if (isIosDevice()) {
      setShowIosButton(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      toast.success("Ilova o'rnatildi");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (showIosButton && !deferredPrompt) {
      setIosHintOpen(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      toast.success("Ilova o'rnatildi");
    }

    setDeferredPrompt(null);
  }, [deferredPrompt, showIosButton]);

  if (installed) {
    return null;
  }

  if (!deferredPrompt && !showIosButton) {
    return (
      <Link
        href="/create"
        className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-gray-900 px-4 text-[14px] font-bold text-white active:scale-95 transition-transform"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        E&apos;lon
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-gray-900 px-4 text-[14px] font-bold text-white active:scale-95 transition-transform"
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        O&apos;rnatish
      </button>

      {iosHintOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 pb-8">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">Ilovani o&apos;rnatish</h3>
              <button
                type="button"
                onClick={() => setIosHintOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
                aria-label="Yopish"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <p className="text-[14px] leading-relaxed text-gray-600">
              Safari brauzerida quyidagi amallarni bajaring:
            </p>
            <ol className="mt-3 space-y-2 text-[14px] text-gray-700">
              <li className="flex items-center gap-2">
                <Share className="h-4 w-4 shrink-0 text-primary" />
                Pastdagi <strong>Ulashish</strong> tugmasini bosing
              </li>
              <li>
                <strong>Bosh ekranga qo&apos;shish</strong> ni tanlang
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setIosHintOpen(false)}
              className="mt-4 h-11 w-full rounded-2xl bg-primary text-[14px] font-bold text-white"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
