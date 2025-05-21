import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token");
  const userInfo = request.cookies.get("user-info");

  const authenticatedRoutes = ["/orders", "/cart", "/checkout", "/profile"];

  const restaurantRoutes = ["/restaurant/dashboard"];
  const deliveryRoutes = ["/delivery/dashboard"];

  const requiresAuth = authenticatedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isRestaurantRoute = restaurantRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isDeliveryRoute = deliveryRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (requiresAuth && (!authToken || !userInfo)) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (authToken && userInfo) {
    try {
      const user = JSON.parse(userInfo.value);

      if (isRestaurantRoute && user.role !== "RESTAURANT") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isDeliveryRoute && user.role !== "DELIVERY") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Failed to check user info:", error);
      const url = new URL("/auth/login", request.url);
      return NextResponse.redirect(url);
    }
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
    // routes with access restricted by role
    "/restaurant/dashboard/:path*",
    "/delivery/dashboard/:path*",
  ],
};
