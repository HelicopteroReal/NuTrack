import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
});

export const loginSchema = registerSchema;

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snacks"]);

export const createCustomFoodSchema = z.object({
  name: z.string().trim().min(1).max(120),
  calories: z.number().nonnegative().max(2000),
  protein: z.number().nonnegative().max(500),
  carbs: z.number().nonnegative().max(500),
  fat: z.number().nonnegative().max(500),
  fiber: z.number().nonnegative().max(200).optional().nullable(),
  servingSize: z.string().trim().min(1).max(80).default("100 g"),
});

export const searchFoodsQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  page: z.coerce.number().int().min(1).max(20).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  source: z.enum(["all", "default", "api", "custom"]).default("all"),
});

export const addDiarySchema = z.object({
  foodId: z.string().min(1),
  mealType: mealTypeSchema,
  quantity: z.number().positive().max(50),
  date: z.string().optional(),
});

export const diaryDateQuerySchema = z.object({
  date: z.string().optional(),
});

export const updateCustomFoodSchema = createCustomFoodSchema.partial();

export const profileUpdateSchema = z.object({
  weight: z.number().positive().max(500),
  height: z.number().positive().max(300),
  age: z.number().int().positive().max(150),
  gender: z.enum(["male", "female", "other"]),
  goal: z.enum(["lose", "maintain", "gain"]),
  calorieTarget: z.number().int().positive().max(10000).optional(),
});

export const weightLogSchema = z.object({
  weight: z.number().positive().max(500),
  date: z.string().optional(),
});

export const historyQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(90).default(14),
});
