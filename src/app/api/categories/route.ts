import { NextResponse } from "next/server";
import { getCachedActiveCategories } from "@/lib/cached-data";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await getCachedActiveCategories();
    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
