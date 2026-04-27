import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const FOODS = [
  // Breakfast staples
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, servingSize: "40 g", source: "default" as const },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, servingSize: "170 g", source: "default" as const },
  { name: "Egg", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, servingSize: "1 large", source: "default" as const },
  { name: "Whole Wheat Bread", calories: 80, protein: 4, carbs: 14, fat: 1, fiber: 2, servingSize: "1 slice", source: "default" as const },
  { name: "Pancakes", calories: 175, protein: 5, carbs: 22, fat: 7, fiber: 1, servingSize: "2 medium", source: "default" as const },
  { name: "Granola", calories: 200, protein: 5, carbs: 32, fat: 8, fiber: 3, servingSize: "50 g", source: "default" as const },
  
  // Fruits
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, servingSize: "1 medium", source: "default" as const },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, servingSize: "1 medium", source: "default" as const },
  { name: "Orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, servingSize: "1 medium", source: "default" as const },
  { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, servingSize: "100 g", source: "default" as const },
  { name: "Strawberries", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, servingSize: "100 g", source: "default" as const },
  { name: "Mango", calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, servingSize: "1 cup", source: "default" as const },
  
  // Proteins
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Ground Beef (lean)", calories: 176, protein: 20, carbs: 0, fat: 10, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Tuna", calories: 132, protein: 29, carbs: 0, fat: 1, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, servingSize: "100 g", source: "default" as const },
  { name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, servingSize: "100 g", source: "default" as const },
  { name: "Shrimp", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, servingSize: "100 g", source: "default" as const },
  
  // Carbs & Grains
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: "1 cup cooked", source: "default" as const },
  { name: "White Rice", calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, servingSize: "1 cup cooked", source: "default" as const },
  { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5, servingSize: "1 cup cooked", source: "default" as const },
  { name: "Pasta", calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, servingSize: "1 cup cooked", source: "default" as const },
  { name: "Sweet Potato", calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, servingSize: "1 medium", source: "default" as const },
  { name: "Potato", calories: 163, protein: 4.3, carbs: 37, fat: 0.2, fiber: 3.8, servingSize: "1 medium", source: "default" as const },
  
  // Vegetables
  { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.1, servingSize: "1 cup", source: "default" as const },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, servingSize: "100 g", source: "default" as const },
  { name: "Carrots", calories: 52, protein: 1.2, carbs: 12, fat: 0.3, fiber: 3.6, servingSize: "1 cup", source: "default" as const },
  { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, servingSize: "100 g", source: "default" as const },
  { name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, servingSize: "1 medium", source: "default" as const },
  { name: "Cucumber", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, servingSize: "100 g", source: "default" as const },
  
  // Dairy & Alternatives
  { name: "Milk (2%)", calories: 122, protein: 8, carbs: 12, fat: 5, fiber: 0, servingSize: "1 cup", source: "default" as const },
  { name: "Cheddar Cheese", calories: 113, protein: 7, carbs: 0.4, fat: 9.3, fiber: 0, servingSize: "28 g", source: "default" as const },
  { name: "Cottage Cheese", calories: 163, protein: 28, carbs: 6, fat: 2.3, fiber: 0, servingSize: "1 cup", source: "default" as const },
  { name: "Almond Milk", calories: 30, protein: 1, carbs: 1, fat: 2.5, fiber: 0.5, servingSize: "1 cup", source: "default" as const },
  
  // Nuts & Seeds
  { name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, servingSize: "28 g", source: "default" as const },
  { name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, servingSize: "2 tbsp", source: "default" as const },
  { name: "Walnuts", calories: 185, protein: 4.3, carbs: 3.9, fat: 18, fiber: 1.9, servingSize: "28 g", source: "default" as const },
  { name: "Chia Seeds", calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, servingSize: "28 g", source: "default" as const },
  
  // Snacks & Others
  { name: "Protein Bar", calories: 200, protein: 20, carbs: 22, fat: 6, fiber: 3, servingSize: "1 bar", source: "default" as const },
  { name: "Hummus", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, servingSize: "100 g", source: "default" as const },
  { name: "Dark Chocolate", calories: 155, protein: 1.4, carbs: 17, fat: 9, fiber: 2, servingSize: "28 g", source: "default" as const },
  { name: "Honey", calories: 64, protein: 0, carbs: 17, fat: 0, fiber: 0, servingSize: "1 tbsp", source: "default" as const },
  { name: "Olive Oil", calories: 119, protein: 0, carbs: 0, fat: 14, fiber: 0, servingSize: "1 tbsp", source: "default" as const },
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

