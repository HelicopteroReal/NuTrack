/**
 * Security Headers Test Suite
 * Verify all security headers are properly set
 *
 * RUN: npm run build && npm run start
 * Then: curl -i http://localhost:3000 | grep -E "(Strict-Transport|Content-Security|X-Frame|X-Content)"
 */

import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

// Mock NextRequest for testing
function createMockRequest(url: string = "http://localhost:3000") {
  return new NextRequest(new Request(url));
}

export async function testSecurityHeaders() {
  const request = createMockRequest();
  const response = middleware(request);

  const securityHeaders = {
    "strict-transport-security": response.headers.get("Strict-Transport-Security"),
    "content-security-policy": response.headers.get("Content-Security-Policy"),
    "x-frame-options": response.headers.get("X-Frame-Options"),
    "x-content-type-options": response.headers.get("X-Content-Type-Options"),
    "x-xss-protection": response.headers.get("X-XSS-Protection"),
    "referrer-policy": response.headers.get("Referrer-Policy"),
    "permissions-policy": response.headers.get("Permissions-Policy"),
  };

  console.log("✓ Security Headers Validation:");
  Object.entries(securityHeaders).forEach(([header, value]) => {
    if (value) {
      console.log(`  ✅ ${header}: ${value?.substring(0, 50)}...`);
    } else {
      console.log(`  ❌ ${header}: MISSING`);
    }
  });

  return securityHeaders;
}

// Run tests
if (require.main === module) {
  testSecurityHeaders().catch(console.error);
}
