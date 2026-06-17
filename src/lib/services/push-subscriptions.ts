import { getPrisma } from "@/lib/db";
import { isPushConfigured, sendPushNotification, type PushPayload } from "@/lib/push";

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  return getPrisma().pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function removePushSubscription(userId: string, endpoint: string) {
  return getPrisma().pushSubscription.deleteMany({
    where: { userId, endpoint },
  });
}

export async function removeAllPushSubscriptions(userId: string) {
  return getPrisma().pushSubscription.deleteMany({
    where: { userId },
  });
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!isPushConfigured()) return { sent: 0, failed: 0 };

  const subscriptions = await getPrisma().pushSubscription.findMany({
    where: { userId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      sent += 1;
    } catch (error) {
      failed += 1;
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await getPrisma().pushSubscription.delete({ where: { id: sub.id } });
      }
      console.error("Push send error:", error);
    }
  }

  return { sent, failed };
}
