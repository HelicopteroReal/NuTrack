import { NextResponse } from "next/server";
import { MealType } from "@prisma/client";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { addDiarySchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const body = await req.json();
  const parsed = addDiarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const food = await prisma.food.findUnique({ where: { id: parsed.data.foodId } });
  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  if (food.source === "custom" && food.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: auth.user.id,
      foodId: parsed.data.foodId,
      quantity: parsed.data.quantity,
      mealType: parsed.data.mealType as MealType,
      date,
    },
    include: { food: true },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
