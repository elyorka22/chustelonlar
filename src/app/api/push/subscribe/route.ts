import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { savePushSubscription } from "@/lib/services/push-subscriptions";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    await savePushSubscription(session.user.id, parsed.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Obuna bo'lishda xatolik" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const endpoint = z.string().url().parse(body.endpoint);

    const { removePushSubscription } = await import("@/lib/services/push-subscriptions");
    await removePushSubscription(session.user.id, endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "Obunadan chiqishda xatolik" }, { status: 500 });
  }
}
