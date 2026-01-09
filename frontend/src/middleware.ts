import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token");
  const userInfo = request.cookies.get("user-info");

  const authenticatedRoutes = ["/orders", "/cart", "/checkout", "/profile", "/restaurant", "/delivery"];

  const requiresAuth = authenticatedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (requiresAuth && (!authToken || !userInfo)) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // routes with authentication needed
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/restaurant/:path*",
    "/delivery/:path*",
    "/delivery/dashboard/:path*",
  ],
};
