import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";

const updateSchema = z.object({
  quantity: z.number().positive().max(25, "Maximum 25 per meal"),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.diaryEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.user.id) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const entry = await prisma.diaryEntry.update({
    where: { id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;

  const existing = await prisma.diaryEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.user.id) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await prisma.diaryEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
