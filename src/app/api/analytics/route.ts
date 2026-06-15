import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAnalytics } from "@/lib/services/ads";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
