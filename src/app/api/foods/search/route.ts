import { NextRequest, NextResponse } from "next/server";
import { searchFoodsQuerySchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/apiAuth";
import { searchFoods as searchExternalFoods } from "@/lib/food-api";
import { handleApiError } from "@/lib/api-handler";
import { ValidationError, ExternalServiceError, DatabaseError } from "@/lib/errors";
import { logger, getCorrelationId } from "@/lib/logger";

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
  const correlationId = getCorrelationId(req);

  try {
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
      const fieldErrors = parsed.error.flatten().fieldErrors;
      throw new ValidationError(
        "Invalid search parameters",
        "Please check your search query and try again",
        { fieldErrors },
      );
    }

    const { q, page, pageSize, source } = parsed.data;

    logger.debug("Food search", {
      correlationId,
      userId: auth.user.id,
      query: q,
      source,
      page,
    });

    // Query local database
    let localFoods: SearchResultFood[] = [];
    try {
      let whereClause: any = {
        OR: [
          { source: "default" },
          { source: "api" },
          { AND: [{ source: "custom" }, { userId: auth.user.id }] },
        ],
      };

      if (q) {
        whereClause = {
          AND: [{ name: { contains: q } }, whereClause],
        };
      }

      const results = await prisma.food.findMany({
        where: whereClause,
        take: pageSize * 2,
        orderBy: [{ source: "asc" }, { createdAt: "desc" }],
      });

      localFoods = results.map((food) => ({
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        servingSize: food.servingSize,
        source: food.source,
      }));
    } catch (error) {
      throw new DatabaseError(error instanceof Error ? error : undefined);
    }

    // Query external API
    let externalFoods: SearchResultFood[] = [];
    if ((source === "all" || source === "api") && q) {
      try {
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
      } catch (error) {
        logger.warn("External food API error", {
          correlationId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Don't throw - return local results only
      }
    }

    // Merge results
    const merged = new Map<string, SearchResultFood>();

    for (const food of localFoods) {
      if (source !== "all" && food.source !== source) continue;
      if (food.source === "custom" && q) {
        // For custom foods with search, filter
        continue;
      }

      merged.set(food.id, food);
    }

    for (const food of externalFoods) {
      const duplicate = Array.from(merged.values()).find(
        (existing) =>
          existing.name.toLowerCase() === food.name.toLowerCase() &&
          existing.source === "api",
      );
      if (!duplicate) {
        merged.set(food.id, food);
      }
    }

    const foods = Array.from(merged.values())
      .sort((a, b) => rankFood(b.name, q) - rankFood(a.name, q))
      .slice(0, pageSize);

    logger.info("Food search completed", {
      correlationId,
      userId: auth.user.id,
      resultsCount: foods.length,
      source,
    });

    const response = NextResponse.json({
      foods,
      page,
      pageSize,
      total: foods.length,
    });

    response.headers.set("x-correlation-id", correlationId);
    return response;
  } catch (error) {
    return handleApiError(error, req);
  }
}
