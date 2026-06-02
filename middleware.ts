import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

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
    "/dashboard/:path*",
    "/employees/:path*",
    "/leads/:path*",
    "/settings/:path*",
    "/portal/:path*",
  ],
};
