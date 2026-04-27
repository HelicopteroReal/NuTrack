import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { createCustomFoodSchema } from "@/lib/validation";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;

  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  if (food.source !== "custom" || food.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.food.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;

  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  // Only allow editing custom foods owned by the user
  if (food.source !== "custom" || food.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createCustomFoodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.food.update({
    where: { id },
    data: {
      name: parsed.data.name,
      calories: parsed.data.calories,
      protein: parsed.data.protein,
      carbs: parsed.data.carbs,
      fat: parsed.data.fat,
      fiber: parsed.data.fiber,
      servingSize: parsed.data.servingSize,
    },
  });

  return NextResponse.json(updated);
}
