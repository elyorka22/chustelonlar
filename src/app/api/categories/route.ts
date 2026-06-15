import { NextResponse } from "next/server";
import { getActiveCategories } from "@/lib/services/categories";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const categories = await getActiveCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
