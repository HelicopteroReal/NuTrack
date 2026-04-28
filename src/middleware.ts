import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security middleware for comprehensive HTTP header protection
 * Implements OWASP security best practices for production
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // HSTS - Force HTTPS for next 1 year (365 days)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // CSP - Prevent XSS, clickjacking, data injection
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires inline scripts
      "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
      "img-src 'self' data: https://world.openfoodfacts.org https://static.openfoodfacts.org https://*.cloudfront.net",
      "font-src 'self'",
      "connect-src 'self' https://world.openfoodfacts.org",
      "frame-ancestors 'none'", // No iframes allowed
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Enable XSS filter in older browsers
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent search engine indexing of sensitive pages
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  // Referrer policy - don't leak info to external sites
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy - restrict browser features
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=(self)",
      "microphone=()",
      "geolocation=(self)",
      "payment=()",
    ].join(", ")
  );

  return response;
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
