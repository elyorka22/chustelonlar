import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/create", "/dashboard"];
  const adminRoutes = ["/admin"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdmin) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/create",
    "/create/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
