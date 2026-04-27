import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "nutrack_session";
const EXPIRES_IN_SECONDS = 60 * 60 * 24 * 14;

function getJwtSecret(): Uint8Array {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (process.env.NODE_ENV === "production" && !jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  
  return new TextEncoder().encode(jwtSecret || "dev-secret-change-me");
}

const secret = getJwtSecret();

type SessionPayload = {
  userId: string;
  email: string;
};

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return compare(password, hashed);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  console.log("[v0] setSessionCookie: setting cookie with token length:", token.length);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: EXPIRES_IN_SECONDS,
    path: "/",
  });
  console.log("[v0] setSessionCookie: cookie set complete");
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  console.log("[v0] getSession: token", token ? "present" : "missing");
  if (!token) return null;
  const session = await verifySessionToken(token);
  console.log("[v0] getSession: session valid:", !!session);
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
