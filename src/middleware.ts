import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { ADMIN_ONLY_ADMIN_PATHS, isStaff } from "@/lib/roles";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const protectedRoutes = ["/create", "/dashboard", "/chegirmalar/create"];
  const adminRoutes = ["/admin"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected && !isAdmin) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && !isStaff(session.user.role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    isAdmin &&
    session.user.role === "MODERATOR" &&
    ADMIN_ONLY_ADMIN_PATHS.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/create",
    "/create/:path*",
    "/chegirmalar/create",
    "/chegirmalar/create/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
