import { NextRequest, NextResponse } from "next/server";
import { getMapAds } from "@/lib/services/ads";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const ads = await getMapAds(category);
    return NextResponse.json(ads, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[api/ads/map]", error);
    return NextResponse.json([], { status: 500 });
  }
}
