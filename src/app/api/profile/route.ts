import { NextResponse } from "next/server";
import { GoalType, GenderType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { calculateCalorieTarget } from "@/lib/calculations";
import { requireApiUser } from "@/lib/apiAuth";

const schema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  age: z.number().int().positive(),
  gender: z.enum(["male", "female", "other"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  calorieTarget: z.number().int().positive().optional(),
});

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { weight, height, age, gender, goal, calorieTarget } = auth.user;
  return NextResponse.json({ weight, height, age, gender, goal, calorieTarget });
}

export async function PATCH(req: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const nextCalorieTarget =
    parsed.data.calorieTarget ||
    calculateCalorieTarget({
      weight: parsed.data.weight,
      height: parsed.data.height,
      age: parsed.data.age,
      gender: parsed.data.gender as GenderType,
      goal: parsed.data.goal as GoalType,
    });

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      weight: parsed.data.weight,
      height: parsed.data.height,
      age: parsed.data.age,
      gender: parsed.data.gender,
      goal: parsed.data.goal,
      calorieTarget: nextCalorieTarget,
      weightLogs: {
        create: {
          weight: parsed.data.weight,
          date: new Date(),
        },
      },
    },
    select: {
      weight: true,
      height: true,
      age: true,
      gender: true,
      goal: true,
      calorieTarget: true,
    },
  });

  return NextResponse.json(updated);
}
