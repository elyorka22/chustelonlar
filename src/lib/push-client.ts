"use client";

import { ensureServiceWorker } from "@/lib/service-worker-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushSubscription() {
  if (!isPushSupported()) return null;

  try {
    const registration = await ensureServiceWorker();
    return registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function subscribeToPush(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { ok: false, error: "Brauzeringiz push bildirishnomalarni qo'llab-quvvatlamaydi" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, error: "Bildirishnomalar uchun ruxsat berilmadi" };
    }

    const keyRes = await fetch("/api/push/vapid-key");
    if (!keyRes.ok) {
      return { ok: false, error: "Push serverda sozlanmagan. Administrator bilan bog'laning." };
    }

    const { publicKey } = (await keyRes.json()) as { publicKey?: string };
    if (!publicKey) {
      return { ok: false, error: "Push kaliti topilmadi" };
    }

    const registration = await ensureServiceWorker();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, error: "Obuna yaratib bo'lmadi" };
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      }),
    });

    if (res.status === 401) {
      return { ok: false, error: "Avval tizimga kiring" };
    }

    if (!res.ok) {
      return { ok: false, error: "Obuna saqlanmadi" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Push subscribe error:", error);
    return { ok: false, error: "Push yoqishda xatolik yuz berdi" };
  }
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean; error?: string }> {
  try {
    const subscription = await getPushSubscription();
    if (!subscription) return { ok: true };

    const endpoint = subscription.endpoint;

    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });

    await subscription.unsubscribe();
    return { ok: true };
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return { ok: false, error: "Push o'chirishda xatolik yuz berdi" };
  }
}
