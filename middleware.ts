import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/diary", "/history", "/profile", "/weight"];
const authRoutes = ["/login", "/register"];
const protectedApiRoutes = ["/api/foods", "/api/diary", "/api/profile", "/api/history", "/api/weight"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("nutrack_session")?.value;
  const { pathname } = request.nextUrl;

  console.log("[v0] middleware:", pathname, "token:", token ? "present" : "missing");

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedApi = protectedApiRoutes.some((route) => pathname.startsWith(route));
  const isAuthApi = pathname.startsWith("/api/auth");

  if (isProtectedApi && !isAuthApi && !token) {
    console.log("[v0] middleware: blocking API - no token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isProtected && !token) {
    console.log("[v0] middleware: redirecting to login - no token");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    console.log("[v0] middleware: redirecting to dashboard - has token");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  console.log("[v0] middleware: allowing through");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/diary/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/weight/:path*",
    "/login",
    "/register",
    "/api/foods/:path*",
    "/api/diary/:path*",
    "/api/profile/:path*",
    "/api/history/:path*",
    "/api/weight/:path*",
  ],
};
