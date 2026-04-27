import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { updateCustomFoodSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;

  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  if (food.source === "custom" && food.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ food });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateCustomFoodSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) {
    return NextResponse.json({ error: "Food not found" }, { status: 404 });
  }

  if (food.source !== "custom" || food.userId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.food.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ food: updated });
}

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
