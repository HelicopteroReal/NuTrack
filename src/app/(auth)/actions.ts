"use server";

import { GenderType, GoalType } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateCalorieTarget } from "@/lib/calculations";
import { comparePassword, createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?error=Invalid%20email%20or%20password");
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    redirect("/register?error=Account%20already%20exists");
  }

  const calorieTarget = calculateCalorieTarget({
    weight: 70,
    height: 170,
    age: 30,
    gender: GenderType.other,
    goal: GoalType.maintain,
  });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      calorieTarget,
    },
  });

  const token = await createSessionToken({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  console.log("[v0] loginAction called with email:", email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("[v0] loginAction: user not found");
    redirect("/login?error=Invalid%20credentials");
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    console.log("[v0] loginAction: invalid password");
    redirect("/login?error=Invalid%20credentials");
  }

  console.log("[v0] loginAction: user authenticated, creating token");
  const token = await createSessionToken({ userId: user.id, email: user.email });
  
  console.log("[v0] loginAction: setting session cookie");
  await setSessionCookie(token);

  console.log("[v0] loginAction: redirecting to dashboard");
  redirect("/dashboard");
}
