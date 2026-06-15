import { NextRequest, NextResponse } from "next/server";
import { getAds } from "@/lib/services/ads";
import { rateLimit } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = await rateLimit(`ads:${ip}`, 100, 60);

  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const result = await getAds(params);

  return NextResponse.json(result);
}
