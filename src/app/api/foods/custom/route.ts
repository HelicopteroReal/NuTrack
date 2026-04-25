import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const foods = await prisma.food.findMany({
    where: {
      source: "custom",
      userId: auth.user.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ foods });
}
