import { NextRequest, NextResponse } from "next/server";
import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ValidationError,
  AuthenticationError,
  DatabaseError,
  RateLimitError,
} from "@/lib/errors";
import { handleApiError } from "@/lib/api-handler";
import { logger, getCorrelationId } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const correlationId = getCorrelationId(req);

  try {
    // Check rate limit
    const limited = checkRateLimit(req, "auth-login", 15, 60_000);
    if (limited) {
      throw new RateLimitError(60);
    }

    // Validate input
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      throw new ValidationError(
        "Invalid JSON in request body",
        "The request body must be valid JSON",
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      throw new ValidationError(
        "Invalid login credentials format",
        "Email must be valid and password must be provided",
        { fieldErrors },
      );
    }

    logger.debug("Login attempt", {
      correlationId,
      email: parsed.data.email,
    });

    // Look up user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error : undefined);
    }

    // User not found = invalid credentials (don't leak user existence)
    if (!user) {
      logger.warn("Login failed: user not found", {
        correlationId,
        email: parsed.data.email,
      });
      throw new AuthenticationError(
        "User not found",
        "Invalid email or password",
      );
    }

    // Verify password
    const validPassword = await comparePassword(parsed.data.password, user.password);
    if (!validPassword) {
      logger.warn("Login failed: invalid password", {
        correlationId,
        userId: user.id,
      });
      throw new AuthenticationError(
        "Invalid password",
        "Invalid email or password",
      );
    }

    // Create session
    let token;
    try {
      token = await createSessionToken({
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error : undefined);
    }

    await setSessionCookie(token);

    logger.info("Login successful", {
      correlationId,
      userId: user.id,
    });

    const response = NextResponse.json({ ok: true });
    response.headers.set("x-correlation-id", correlationId);
    return response;
  } catch (error) {
    return handleApiError(error, req);
  }
}
