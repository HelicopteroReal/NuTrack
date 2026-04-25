import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

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
