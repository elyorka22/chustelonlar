import { NextRequest, NextResponse } from "next/server";
import { getActiveChegirmalar } from "@/lib/services/chegirmalar";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") || undefined;

  try {
    const items = await getActiveChegirmalar(category);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
