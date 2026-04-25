import { FoodSource } from "@prisma/client";
import { prisma } from "@/lib/db";

type ExternalFood = {
  code?: string;
  product_name?: string;
  serving_size?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
  };
};

export type NormalizedFood = {
  externalId: string | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  servingSize: string;
  source: FoodSource;
};

const apiWindow = new Map<string, { count: number; resetAt: number }>();

function canCallExternalApi(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = apiWindow.get(key);

  if (!bucket || bucket.resetAt <= now) {
    apiWindow.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  apiWindow.set(key, bucket);
  return true;
}

export function normalizeFood(apiFood: ExternalFood): NormalizedFood | null {
  const name = apiFood.product_name?.trim();
  if (!name) return null;

  const calories = Number(apiFood.nutriments?.["energy-kcal_100g"] ?? 0);
  const protein = Number(apiFood.nutriments?.proteins_100g ?? 0);
  const carbs = Number(apiFood.nutriments?.carbohydrates_100g ?? 0);
  const fat = Number(apiFood.nutriments?.fat_100g ?? 0);
  const fiber = Number(apiFood.nutriments?.fiber_100g ?? 0);

  return {
    externalId: apiFood.code || null,
    name,
    calories: Number.isFinite(calories) ? calories : 0,
    protein: Number.isFinite(protein) ? protein : 0,
    carbs: Number.isFinite(carbs) ? carbs : 0,
    fat: Number.isFinite(fat) ? fat : 0,
    fiber: Number.isFinite(fiber) ? fiber : null,
    servingSize: apiFood.serving_size?.trim() || "100 g",
    source: "api",
  };
}

export async function cacheFood(food: NormalizedFood) {
  if (food.source !== "api") return null;

  if (food.externalId) {
    return prisma.food.upsert({
      where: { externalId: food.externalId },
      update: {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        servingSize: food.servingSize,
        source: "api",
      },
      create: {
        externalId: food.externalId,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        servingSize: food.servingSize,
        source: "api",
      },
    });
  }

  const existing = await prisma.food.findFirst({
    where: {
      source: "api",
      userId: null,
      name: food.name,
      servingSize: food.servingSize,
    },
  });

  if (existing) {
    return prisma.food.update({
      where: { id: existing.id },
      data: {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
      },
    });
  }

  return prisma.food.create({
    data: {
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      servingSize: food.servingSize,
      source: "api",
    },
  });
}

export async function searchFoods(query: string, page = 1, pageSize = 12) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!canCallExternalApi(`food-search:${trimmed.toLowerCase()}`, 20, 60_000)) {
    return [];
  }

  const endpoint = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  endpoint.searchParams.set("search_terms", trimmed);
  endpoint.searchParams.set("search_simple", "1");
  endpoint.searchParams.set("action", "process");
  endpoint.searchParams.set("json", "1");
  endpoint.searchParams.set("page", String(page));
  endpoint.searchParams.set("page_size", String(pageSize));

  const response = await fetch(endpoint, {
    method: "GET",
    headers: { "User-Agent": "NuTrack/1.0" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return [];
  }

  const body = (await response.json()) as { products?: ExternalFood[] };
  const products = body.products ?? [];
  const normalized = products.map(normalizeFood).filter((item): item is NormalizedFood => item !== null);

  await Promise.all(normalized.slice(0, 20).map((food) => cacheFood(food)));

  return normalized;
}
