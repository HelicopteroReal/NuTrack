import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { weightLogSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 30, 90);

  const logs = await prisma.weightLog.findMany({
    where: { userId: auth.user.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  const formatted = logs.reverse().map((log) => ({
    id: log.id,
    weight: log.weight,
    date: format(log.date, "yyyy-MM-dd"),
    displayDate: format(log.date, "MMM d"),
  }));

  return NextResponse.json({
    logs: formatted,
    currentWeight: auth.user.weight,
  });
}

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const body = await req.json();
  const parsed = weightLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

  const log = await prisma.weightLog.create({
    data: {
      userId: auth.user.id,
      weight: parsed.data.weight,
      date,
    },
  });

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { weight: parsed.data.weight },
  });

  return NextResponse.json({
    log: {
      id: log.id,
      weight: log.weight,
      date: format(log.date, "yyyy-MM-dd"),
      displayDate: format(log.date, "MMM d"),
    },
  }, { status: 201 });
}
