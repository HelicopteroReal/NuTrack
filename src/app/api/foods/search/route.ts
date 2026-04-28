import { NextRequest, NextResponse } from "next/server";
import { searchFoodsQuerySchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { searchFoods as searchExternalFoods } from "@/lib/food-api";

type SearchResultFood = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  servingSize: string;
  source: "default" | "api" | "custom";
};

function rankFood(name: string, query: string) {
  const normalizedName = name.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  if (normalizedName === normalizedQuery) return 100;
  if (normalizedName.startsWith(normalizedQuery)) return 70;
  if (normalizedName.includes(normalizedQuery)) return 40;
  return 10;
}

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if (auth.response || !auth.user) return auth.response;

  const url = new URL(req.url);
  const parsed = searchFoodsQuerySchema.safeParse({
    q: url.searchParams.get("q") || "",
    page: url.searchParams.get("page") || 1,
    pageSize: url.searchParams.get("pageSize") || 20,
    source: url.searchParams.get("source") || "all",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  const { q, page, pageSize, source } = parsed.data;

  const localFoods = await prisma.food.findMany({
    where: {
      AND: [
        { name: { contains: q, mode: "insensitive" } },
        {
          OR: [
            { source: "default" },
            { source: "api" },
            { AND: [{ source: "custom" }, { userId: auth.user.id }] },
          ],
        },
      ],
    },
    take: pageSize * 2,
    orderBy: [{ source: "asc" }, { createdAt: "desc" }],
  });

  let externalFoods: SearchResultFood[] = [];
  if (source === "all" || source === "api") {
    const fromApi = await searchExternalFoods(q, page, pageSize);
    externalFoods = fromApi.map((food, index) => ({
      id: food.externalId || `api-${index}-${food.name}`,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      servingSize: food.servingSize,
      source: "api",
    }));
  }

  const merged = new Map<string, SearchResultFood>();

  for (const food of localFoods) {
    if (source !== "all" && food.source !== source) continue;
    if (food.source === "custom" && food.userId !== auth.user.id) continue;

    merged.set(food.id, {
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      servingSize: food.servingSize,
      source: food.source,
    });
  }

  for (const food of externalFoods) {
    const duplicate = Array.from(merged.values()).find(
      (existing) => existing.name.toLowerCase() === food.name.toLowerCase() && existing.source === "api"
    );
    if (!duplicate) {
      merged.set(food.id, food);
    }
  }

  const foods = Array.from(merged.values())
    .sort((a, b) => rankFood(b.name, q) - rankFood(a.name, q))
    .slice(0, pageSize);

  return NextResponse.json({ foods, page, pageSize, total: foods.length });
}
