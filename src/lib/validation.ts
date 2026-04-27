import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,128}$/;

export const registerSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(
      passwordRegex,
      "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)"
    ),
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

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
