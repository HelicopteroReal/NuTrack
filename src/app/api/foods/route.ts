import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";

export async function GET(req: Request) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const foods = await prisma.food.findMany({
    where: {
      ...(q
        ? {
            name: {
              contains: q,
            },
          }
        : {}),
      OR: [{ source: "default" }, { source: "api" }, { source: "custom", userId: auth.user.id }],
    },
    take: 25,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ foods });
}
