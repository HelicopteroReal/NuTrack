import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCalorieTarget } from "@/lib/calculations";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, "auth-register", 10, 60_000);
  if (limited) return limited;

  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      calorieTarget: calculateCalorieTarget({
        weight: 70,
        height: 170,
        age: 30,
        gender: "other",
        goal: "maintain",
      }),
    },
  });

  const token = await createSessionToken({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
