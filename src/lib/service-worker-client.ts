"use client";

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("Service worker qo'llab-quvvatlanmaydi");
  }

  if (!registrationPromise) {
    registrationPromise = (async () => {
      const existing = await navigator.serviceWorker.getRegistration("/");
      if (existing) {
        await navigator.serviceWorker.ready;
        return existing;
      }

      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return navigator.serviceWorker.ready;
    })().catch((error) => {
      registrationPromise = null;
      throw error;
    });
  }

  return registrationPromise;
}
