import { NextResponse } from "next/server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push";

export async function GET() {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push not configured" }, { status: 503 });
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Push not configured" }, { status: 503 });
  }

  return NextResponse.json({ publicKey });
}
