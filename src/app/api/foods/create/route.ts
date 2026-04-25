import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { createCustomFoodSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const body = await req.json();
  const parsed = createCustomFoodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const food = await prisma.food.create({
    data: {
      ...parsed.data,
      source: "custom",
      userId: auth.user.id,
      fiber: parsed.data.fiber ?? null,
    },
  });

  return NextResponse.json({ food }, { status: 201 });
}
