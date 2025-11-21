// Purpose: Protect routes and handle authentication redirects
// Protects: /admin (admin only), /dashboard (authenticated users), /auth (redirect if logged in)
// Role-based: Redirects users based on their role (ADMIN/USER)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    // Redirect authenticated users away from auth pages based on role
    if (isAuthPage && isAuth) {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Restrict admin pages to ADMIN role only
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
        
        // Allow access to auth pages without token
        if (isAuthPage) {
          return true;
        }
        
        // Require token for all protected pages
        return !!token;
      },
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*"],
};