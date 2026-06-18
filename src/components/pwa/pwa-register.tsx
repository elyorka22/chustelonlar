"use client";

import { useEffect } from "react";
import { ensureServiceWorker } from "@/lib/service-worker-client";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    ensureServiceWorker().catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
