import { NextResponse } from "next/server";
import { purgeDeletedAdImages } from "@/lib/services/image-cleanup";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await purgeDeletedAdImages();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Image purge cron error:", error);
    return NextResponse.json({ error: "Purge failed" }, { status: 500 });
  }
}
