"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { PwaInstallSheet } from "@/components/pwa/pwa-install-sheet";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosButton, setShowIosButton] = useState(false);

  const sheetVariant = showIosButton && !deferredPrompt ? "ios" : "android";

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
      setSheetOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const openSheet = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleNativeInstall = useCallback(async () => {
    if (!deferredPrompt) {
      setSheetOpen(true);
      return;
    }

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setSheetOpen(false);
      }
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleInstallClick = useCallback(() => {
    if (showIosButton && !deferredPrompt) {
      openSheet();
      return;
    }
    if (deferredPrompt) {
      openSheet();
      return;
    }
  }, [deferredPrompt, openSheet, showIosButton]);

  if (installed) {
    return null;
  }

  if (!deferredPrompt && !showIosButton) {
    return (
      <Link
        href="/create"
        className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-[14px] font-bold text-white shadow-md shadow-primary/25 active:scale-95 transition-transform"
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
        onClick={handleInstallClick}
        className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-[14px] font-bold text-white shadow-md shadow-primary/25 active:scale-95 transition-transform"
      >
        <Download className="h-4 w-4" strokeWidth={2.5} />
        O&apos;rnatish
      </button>

      <PwaInstallSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        variant={sheetVariant}
        onConfirmInstall={handleNativeInstall}
        installing={installing}
      />
    </>
  );
}
