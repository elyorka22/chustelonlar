import { NextRequest, NextResponse } from "next/server";
import { getMapAds } from "@/lib/services/ads";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const ads = await getMapAds(category);
  return NextResponse.json(ads);
}
