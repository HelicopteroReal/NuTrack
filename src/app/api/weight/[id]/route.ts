import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const { id } = await params;

  const log = await prisma.weightLog.findUnique({ where: { id } });
  if (!log || log.userId !== auth.user.id) {
    return NextResponse.json({ error: "Weight log not found" }, { status: 404 });
  }

  await prisma.weightLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
