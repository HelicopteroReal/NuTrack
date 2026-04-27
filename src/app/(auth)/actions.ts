"use server";

import { GenderType, GoalType } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateCalorieTarget } from "@/lib/calculations";
import { comparePassword, createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validation";

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
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=Invalid%20credentials");
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    redirect("/login?error=Invalid%20credentials");
  }

  const valid = await comparePassword(parsed.data.password, user.password);
  if (!valid) {
    redirect("/login?error=Invalid%20credentials");
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  redirect("/dashboard");
}
