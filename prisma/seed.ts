import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const FOODS = [
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, servingSize: "40 g", source: "default" as const },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: "1 medium", source: "default" as const },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, servingSize: "170 g", source: "default" as const },
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: "1 cup cooked", source: "default" as const },
  { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, servingSize: "100 g", source: "default" as const },
  { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, servingSize: "1 large", source: "default" as const },
  { name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, servingSize: "1 medium", source: "default" as const },
  { name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, servingSize: "28 g", source: "default" as const },
  { name: "Whole Wheat Bread", calories: 80, protein: 4, carbs: 14, fat: 1, fiber: 2, servingSize: "1 slice", source: "default" as const },
  { name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, servingSize: "2 tbsp", source: "default" as const },
];

async function main() {
  await prisma.food.deleteMany({
    where: {
      source: "default",
    },
  });

  await prisma.food.createMany({ data: FOODS });

  const demoEmail = "demo@nutrack.app";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existing) {
    await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashSync("password123", 10),
        weight: 72,
        height: 175,
        age: 29,
        gender: "male",
        goal: "maintain",
        calorieTarget: 2300,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

