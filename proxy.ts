import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_ROUTES = ["/dashboard", "/employees", "/leads", "/settings", "/portal"];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some(r => pathname.startsWith(r));

  // Not logged in → block protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in → block auth routes, redirect to their home
  if (token && isAuthRoute) {
    const role = (token.role as string) ?? "EMPLOYEE";
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/dashboard" : "/portal", req.url));
  }

  if (!token) return NextResponse.next();

  const role = (token.role as string) ?? "EMPLOYEE";

  // Employees cannot access admin-only routes
  if (role === "EMPLOYEE") {
    const adminOnly = ["/dashboard", "/employees", "/leads", "/settings"];
    if (adminOnly.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  // Admins don't use the employee portal
  if (role === "ADMIN" && pathname.startsWith("/portal")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login/:path*",
    "/signup/:path*",
    "/dashboard/:path*",
    "/employees/:path*",
    "/leads/:path*",
    "/settings/:path*",
    "/portal/:path*",
  ],
};
