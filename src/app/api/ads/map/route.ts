import { NextRequest, NextResponse } from "next/server";
import { getCachedMapAds } from "@/lib/cached-data";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category") || "";
    const ads = await getCachedMapAds(category);
    return NextResponse.json(ads, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[api/ads/map]", error);
    return NextResponse.json([], { status: 500 });
  }
}
